import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, of, retry, delay, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface PrayerTimeRow {
  prayer: string;
  adhan: string;
  iqamah: string;
}

export interface IqamaTimes {
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

const CACHE_KEY = 'iqama_times_cache';

@Injectable({
  providedIn: 'root'
})
export class IqamaService {

  iqamaTimes: IqamaTimes = {
    fajr: '', dhuhr: '', asr: '', maghrib: '', isha: ''
  };

  private apiUrl = `${environment.supabase.url}/rest/v1/prayer_times`;

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
        if (parsed.fajr || parsed.dhuhr || parsed.asr || parsed.maghrib || parsed.isha) {
          return parsed;
        }
      }
    } catch (e) { /* ignore */ }
    return null;
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'apikey': environment.supabase.anonKey,
      'Authorization': `Bearer ${environment.supabase.anonKey}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Fetch iqama times from Supabase with retry (3 attempts, exponential backoff).
   * Falls back to cached values if all retries fail.
   */
  fetchIqamaTimes(): Observable<IqamaTimes> {
    return this.http.get<PrayerTimeRow[]>(this.apiUrl, {
      headers: this.getHeaders(),
      params: { select: '*' }
    }).pipe(
      // Retry up to 3 times with exponential backoff (1s, 2s, 4s)
      retryWithBackoff(3, 1000),
      map(rows => {
        const times: IqamaTimes = { fajr: '', dhuhr: '', asr: '', maghrib: '', isha: '' };
        for (const row of rows) {
          const prayerKey = this.normalizePrayerName(row.prayer);
          if (prayerKey && prayerKey in times) {
            (times as any)[prayerKey] = this.to12Hour(row.iqamah);
          }
        }
        this.iqamaTimes = times;
        this.saveToCache(times);
        console.log('Iqama times fetched from Supabase:', times);
        return times;
      }),
      catchError(err => {
        console.error('Failed to fetch iqama times from Supabase after retries:', err);
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
        if (parsed.fajr || parsed.dhuhr || parsed.asr || parsed.maghrib || parsed.isha) {
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
          console.log(`Supabase retry ${retryCount}/${maxRetries} in ${backoff}ms...`);
          return timer(backoff).pipe(
            mergeMap(() => source)
          );
        }
        throw err;
      })
    );
  };
}
