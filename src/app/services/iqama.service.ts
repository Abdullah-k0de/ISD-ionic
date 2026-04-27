import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of, retry, delay, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface PrayerTimeRow {
  prayer: string;
  adhan: string;
  iqamah: string;
}

export interface IqamaScheduleRow {
  id: number;
  prayer: string;
  iqamah: string;
  effective_date: string; // 'YYYY-MM-DD'
}

export interface IqamaTimes {
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  jummah_1: string;
  jummah_2: string;
}

const CACHE_KEY = 'iqama_times_cache';

@Injectable({
  providedIn: 'root'
})
export class IqamaService {

  iqamaTimes: IqamaTimes = {
    fajr: '', dhuhr: '', asr: '', maghrib: '', isha: '', jummah_1: '', jummah_2: ''
  };

  private apiUrl = `${environment.api.baseUrl}/api/prayer-times`;

  constructor(private http: HttpClient) {
    // Load cached times on startup
    this.loadFromCache();
  }

  /** Return cached iqama times (if any) for immediate display */
  getCachedIqamaTimes(): IqamaTimes | null {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as IqamaTimes;
        if (parsed.fajr || parsed.dhuhr || parsed.asr || parsed.maghrib || parsed.isha || parsed.jummah_1 || parsed.jummah_2) {
          return parsed;
        }
      }
    } catch (e) { /* ignore */ }
    return null;
  }

  /**
   * Fetch iqama times from API with retry (3 attempts, exponential backoff).
   * Falls back to cached values if all retries fail.
   */
  fetchIqamaTimes(): Observable<IqamaTimes> {
    return this.http.get<{ data: PrayerTimeRow[] }>(`${this.apiUrl}/iqamah`).pipe(
      retryWithBackoff(3, 1000),
      map(response => {
        const rows = response.data;
        const times: IqamaTimes = { fajr: '', dhuhr: '', asr: '', maghrib: '', isha: '', jummah_1: '', jummah_2: '' };
        for (const row of rows) {
          const prayerKey = this.normalizePrayerName(row.prayer);
          if (prayerKey === 'maghrib') {
            continue; // NEVER fetch maghrib from DB, it must be calculated
          }
          if (prayerKey && prayerKey in times) {
            (times as any)[prayerKey] = this.to12Hour(row.iqamah);
          }
        }
        this.iqamaTimes = times;
        this.saveToCache(times);
        console.log('Iqama times fetched from API (excluding Maghrib):', times);
        return times;
      }),
      catchError(err => {
        console.error('Failed to fetch iqama times from API after retries:', err);
        // Return cached values
        return of(this.iqamaTimes);
      })
    );
  }

  /** Load last known iqama times from localStorage */
  private loadFromCache(): void {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as IqamaTimes;
        if (parsed.fajr || parsed.dhuhr || parsed.asr || parsed.maghrib || parsed.isha || parsed.jummah_1 || parsed.jummah_2) {
          this.iqamaTimes = parsed;
          console.log('Loaded iqama times from cache:', parsed);
        }
      }
    } catch (e) {
      // Ignore parse errors
    }
  }

  /** Save iqama times to localStorage */
  private saveToCache(times: IqamaTimes): void {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(times));
    } catch (e) {
      // Ignore storage errors
    }
  }

  /** Normalize prayer names (e.g. "zuhr" → "dhuhr", "Fajr" → "fajr") */
  private normalizePrayerName(name: string): string {
    const lower = name.toLowerCase().trim();
    if (lower === 'zuhr' || lower === 'dhuhr' || lower === 'dhur' || lower === 'duhr') return 'dhuhr';
    if (lower === 'fajr') return 'fajr';
    if (lower === 'asr') return 'asr';
    if (lower === 'maghrib') return 'maghrib';
    if (lower === 'isha') return 'isha';
    if (lower === 'jummah_1') return 'jummah_1';
    if (lower === 'jummah_2') return 'jummah_2';
    return lower;
  }

  /** Convert 24h time string to 12h AM/PM format */
  private to12Hour(time24: string): string {
    if (!time24) return '';
    const parts = time24.split(':');
    if (parts.length < 2) return time24;
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    if (hours === 0) hours = 12;
    else if (hours > 12) hours -= 12;
    return `${hours}:${minutes} ${ampm}`;
  }

  /**
   * Fetch upcoming iqama schedule changes from the API.
   * Returns rows where effective_date >= today, ordered by effective_date ascending.
   */
  fetchIqamaSchedule(): Observable<IqamaScheduleRow[]> {
    return this.http.get<{ data: IqamaScheduleRow[] }>(`${this.apiUrl}/schedule`).pipe(
      retryWithBackoff(3, 1000),
      map(response => {
        const rows = response.data;
        console.log('Iqama schedule fetched from API:', rows);
        return rows;
      }),
      catchError(err => {
        console.error('Failed to fetch iqama schedule:', err);
        return of([]);
      })
    );
  }

  /** Format a prayer key into a display-friendly name */
  formatPrayerDisplayName(prayer: string): string {
    const map: Record<string, string> = {
      fajr: 'Fajr',
      dhuhr: 'Dhuhr',
      zuhr: 'Dhuhr',
      asr: 'Asr',
      maghrib: 'Maghrib',
      isha: 'Isha',
      jummah_1: 'Jummah 1',
      jummah_2: 'Jummah 2',
    };
    return map[prayer.toLowerCase().trim()] || prayer;
  }
}

/** Custom retry operator with exponential backoff */
function retryWithBackoff(maxRetries: number, initialDelay: number) {
  return <T>(source: Observable<T>): Observable<T> => {
    let retryCount = 0;
    return source.pipe(
      catchError(err => {
        retryCount++;
        if (retryCount <= maxRetries) {
          const backoff = initialDelay * Math.pow(2, retryCount - 1);
          console.log(`API retry ${retryCount}/${maxRetries} in ${backoff}ms...`);
          return timer(backoff).pipe(
            mergeMap(() => source)
          );
        }
        throw err;
      })
    );
  };
}
