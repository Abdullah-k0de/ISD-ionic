import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of, retry, delay, timer } from 'rxjs';
import { mergeMap, shareReplay } from 'rxjs/operators';
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

  private combinedCache$: Observable<{ times: IqamaTimes, schedule: IqamaScheduleRow[] }> | null = null;

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

  private fetchCombinedData(forceRefresh: boolean): Observable<{ times: IqamaTimes, schedule: IqamaScheduleRow[] }> {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    const cacheKey = `iqama_combined_daily_${dateStr}`;

    if (!forceRefresh) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          this.iqamaTimes = parsed.times;
          return of(parsed);
        } catch (e) {}
      }
    }

    if (!this.combinedCache$ || forceRefresh) {
      this.combinedCache$ = this.http.get<{ data: { iqamah: PrayerTimeRow[], schedule: IqamaScheduleRow[] } }>(`${this.apiUrl}/all`).pipe(
        retryWithBackoff(3, 1000),
        map(response => {
          const rows = response.data.iqamah || [];
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
          this.saveToCache(times); // Keep legacy cache for getCachedIqamaTimes fallback

          const schedule = response.data.schedule || [];
          const combinedData = { times, schedule };

          try {
            for (let i = localStorage.length - 1; i >= 0; i--) {
              const key = localStorage.key(i);
              if (key && key.startsWith('iqama_combined_daily_') && key !== cacheKey) {
                localStorage.removeItem(key);
              }
            }
            localStorage.setItem(cacheKey, JSON.stringify(combinedData));
          } catch (e) {}

          console.log('Combined Iqama data fetched from API:', combinedData);
          return combinedData;
        }),
        catchError(err => {
          console.error('Failed to fetch combined iqama data from API after retries:', err);
          return of({ times: this.iqamaTimes, schedule: [] });
        }),
        shareReplay(1)
      );
    }
    return this.combinedCache$;
  }

  /**
   * Fetch iqama times using the combined API endpoint.
   */
  fetchIqamaTimes(forceRefresh: boolean = false): Observable<IqamaTimes> {
    return this.fetchCombinedData(forceRefresh).pipe(
      map(data => data.times)
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
          console.log('Loaded iqama times from legacy cache:', parsed);
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
   * Fetch upcoming iqama schedule changes using the combined API endpoint.
   */
  fetchIqamaSchedule(forceRefresh: boolean = false): Observable<IqamaScheduleRow[]> {
    return this.fetchCombinedData(forceRefresh).pipe(
      map(data => data.schedule)
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
