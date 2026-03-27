import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpService } from 'src/app/services/http.service';
import { IqamaService, IqamaTimes } from 'src/app/services/iqama.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit, OnDestroy {
  hourOfDay: string = 'day';
  iqamaTimes: IqamaTimes = { fajr: '', dhuhr: '', asr: '', maghrib: '', isha: '' };

  showClock = false;
  showClockHint = false;
  private countdownTimer: any;

  // Current time (updated every second for countdown)
  currentTimeStr = '';
  countdownStr = '';
  currentPrayerName = '';
  nextPrayerName = '';
  nextPrayerTime = '';
  
  hijriDate = '';
  gregorianDate = '';

  prayerNames: Record<string, { en: string; ar: string }> = {
    fajr: { en: 'Fajr', ar: 'الفجر' },
    sunrise: { en: 'Sunrise', ar: 'الشروق' },
    dhuhr: { en: 'Dhuhr', ar: 'الظهر' },
    asr: { en: 'Asr', ar: 'العصر' },
    maghrib: { en: 'Maghrib', ar: 'المغرب' },
    isha: { en: 'Isha', ar: 'العشاء' },
  };

  prayerOrder = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

  constructor(
    public httpService: HttpService,
    private iqamaService: IqamaService
  ) {
    this.updateImageBasedOnTime();
    this.httpService.getNewAdhanTimes();

    // Load cached iqama times immediately
    const cached = this.iqamaService.getCachedIqamaTimes();
    if (cached) this.iqamaTimes = cached;

    this.iqamaService.fetchIqamaTimes().subscribe(times => {
      this.iqamaTimes = times;
    });

    // Restore view preference
    const pref = localStorage.getItem('prayer-view-mode');
    if (pref === 'clock') this.showClock = true;
  }

  ngOnInit(): void {
    this.updateCurrentState();
    this.computeDates();
    this.countdownTimer = setInterval(() => this.updateCurrentState(), 1000);
    this.showClockHintOnce();
  }
  
  private computeDates(): void {
    const today = new Date();
    try {
      const hijriFormatter = new Intl.DateTimeFormat('en-TN-u-ca-islamic', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      this.hijriDate = hijriFormatter.format(today);
    } catch (e) {
      this.hijriDate = ''; 
    }
    this.gregorianDate = today.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).toUpperCase();
  }

  ngOnDestroy(): void {
    clearInterval(this.countdownTimer);
  }

  toggleView(): void {
    this.showClock = !this.showClock;
    localStorage.setItem('prayer-view-mode', this.showClock ? 'clock' : 'list');
  }

  /** Show a one-time inline hint pointing at the toggle */
  private showClockHintOnce(): void {
    if (this.showClock) return;
    const shown = localStorage.getItem('clock-hint-v4');
    if (shown) return;

    localStorage.setItem('clock-hint-v4', '1');
    setTimeout(() => {
      this.showClockHint = true;
      setTimeout(() => { this.showClockHint = false; }, 5000);
    }, 2000);
  }

  dismissHint(): void {
    this.showClockHint = false;
  }

  handleRefresh(event: any) {
    this.httpService.getNewAdhanTimes();
    this.iqamaService.fetchIqamaTimes().subscribe(times => {
      this.iqamaTimes = times;
      this.updateImageBasedOnTime();
      event.target.complete();
    });
  }

  async updateImageBasedOnTime() {
    const currentHour = new Date().getHours();
    this.hourOfDay = currentHour >= 18 ? 'night' : 'day';
  }

  public openMapsApp(address: string) {
    window.location.href = 'https://maps.apple.com/?q=' + encodeURIComponent(address);
  }

  /** Parse "HH:MM AM/PM" or "HH:MM" to a Date object for today */
  private parseTimeToDate(timeStr: string): Date | null {
    if (!timeStr) return null;
    const now = new Date();
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
    if (!match) return null;

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3]?.toLowerCase();

    if (ampm === 'pm' && hours !== 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;

    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
    return d;
  }

  /** Get the azan time string for a given prayer name */
  getAzanTime(name: string): string {
    const data = this.httpService.adhans?.data?.salah?.at(0);
    if (!data) return '';
    const map: Record<string, string> = {
      fajr: data.fajr, sunrise: data.sunrise,
      dhuhr: data.zuhr, asr: data.asr,
      maghrib: data.maghrib, isha: data.isha,
    };
    return map[name] || '';
  }

  /** Get iqama time for a given prayer */
  getIqamaTime(name: string): string {
    if (name === 'sunrise') return '';
    const map: Record<string, string> = {
      fajr: this.iqamaTimes.fajr,
      dhuhr: this.iqamaTimes.dhuhr,
      asr: this.iqamaTimes.asr,
      maghrib: this.iqamaTimes.maghrib,
      isha: this.iqamaTimes.isha,
    };
    return map[name] || '';
  }

  /** Check if a prayer is the active (current) one */
  isActivePrayer(name: string): boolean {
    return this.currentPrayerName === name;
  }

  /** Check if a prayer is the next one */
  isNextPrayer(name: string): boolean {
    return this.nextPrayerName === name;
  }

  /** Check if a prayer is in the past */
  isPastPrayer(name: string): boolean {
    const activeIdx = this.prayerOrder.indexOf(this.currentPrayerName);
    const thisIdx = this.prayerOrder.indexOf(name);
    return thisIdx < activeIdx;
  }

  /** Update current/next prayer and countdown */
  private updateCurrentState(): void {
    const now = new Date();
    this.currentTimeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    // Find current and next prayer
    let currentPrayer = 'isha';
    let nextPrayer = 'fajr';
    let nextDate: Date | null = null;

    for (let i = 0; i < this.prayerOrder.length; i++) {
      const name = this.prayerOrder[i];
      const timeStr = this.getAzanTime(name);
      const d = this.parseTimeToDate(timeStr);
      if (d && now < d) {
        nextPrayer = name;
        nextDate = d;
        currentPrayer = i > 0 ? this.prayerOrder[i - 1] : 'isha';
        break;
      }
      if (i === this.prayerOrder.length - 1) {
        // Past all prayers today
        currentPrayer = 'isha';
        nextPrayer = 'fajr';
        nextDate = this.parseTimeToDate(this.getAzanTime('fajr'));
        if (nextDate) nextDate.setDate(nextDate.getDate() + 1);
      }
    }

    this.currentPrayerName = currentPrayer;
    this.nextPrayerName = nextPrayer;
    this.nextPrayerTime = this.getAzanTime(nextPrayer);

    // Countdown
    if (nextDate) {
      const diff = nextDate.getTime() - now.getTime();
      if (diff > 0) {
        const totalSec = Math.floor(diff / 1000);
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        this.countdownStr = h > 0
          ? `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`
          : `${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
      } else {
        this.countdownStr = '--:--';
      }
    }
  }
}
