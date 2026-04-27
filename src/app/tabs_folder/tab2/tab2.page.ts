import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpService } from 'src/app/services/http.service';
import { IqamaService, IqamaTimes, IqamaScheduleRow } from 'src/app/services/iqama.service';
import { TimeSimulationService } from 'src/app/services/time-simulation.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit, OnDestroy {
  hourOfDay: string = 'day';
  iqamaTimes: IqamaTimes = { fajr: '', dhuhr: '', asr: '', maghrib: '', isha: '', jummah_1: '', jummah_2: '' };
  private lastFetchedDate: number | null = null;

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
  isFriday = false;
  showDebugPanel = false; // Set to true to see simulation controls

  // Iqama schedule banner
  bannerText = '';
  scheduledChanges: IqamaScheduleRow[] = [];

  prayerNames: Record<string, { en: string; ar: string }> = {
    fajr: { en: 'Fajr', ar: 'الفجر' },
    sunrise: { en: 'Sunrise', ar: 'الشروق' },
    dhuhr: { en: 'Dhuhr', ar: 'الظهر' },
    asr: { en: 'Asr', ar: 'العصر' },
    maghrib: { en: 'Maghrib', ar: 'المغرب' },
    isha: { en: 'Isha', ar: 'العشاء' },
    lastThird: { en: 'Last 3rd', ar: 'الثلث الأخير' },
  };

  prayerOrder = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha', 'lastThird'];

  constructor(
    public httpService: HttpService,
    private iqamaService: IqamaService,
    public timeService: TimeSimulationService
  ) {
    this.updateImageBasedOnTime();
    this.httpService.getNewAdhanTimes();

    // Load cached iqama times immediately
    const cached = this.iqamaService.getCachedIqamaTimes();
    if (cached) this.iqamaTimes = cached;

    this.iqamaService.fetchIqamaTimes().subscribe(times => {
      this.iqamaTimes = times;
    });

    // Fetch iqama schedule for banner
    this.iqamaService.fetchIqamaSchedule().subscribe(rows => {
      this.scheduledChanges = rows;
      this.buildBannerText();
    });

    // Restore view preference
    const pref = localStorage.getItem('prayer-view-mode');
    if (pref === 'clock') this.showClock = true;
  }

  ngOnInit(): void {
    if (!this.showDebugPanel) {
      this.timeService.setIsSimulationMode(false);
    }
    this.updateCurrentState();
    this.computeDates();
    this.countdownTimer = setInterval(() => this.updateCurrentState(), 1000);
    this.showClockHintOnce();

    // Refresh when simulation settings change
    this.timeService.isSimulationMode$.subscribe(() => this.onSimulationChange());
    this.timeService.simulatedDate$.subscribe(() => this.onSimulationChange());
    this.timeService.simulatedTime$.subscribe(() => this.updateCurrentState());
  }

  private onSimulationChange(): void {
    this.httpService.getNewAdhanTimes();
    this.updateCurrentState();
    this.computeDates();
    this.updateImageBasedOnTime();
  }

  private computeDates(): void {
    const today = this.timeService.getNow();

    // Use instant local calculation (same as Clock) to ensure synchronization during simulation
    try {
      const day = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { day: 'numeric' }).format(today);
      const monthNum = parseInt(
        new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { month: 'numeric' }).format(today), 10
      );
      const year = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { year: 'numeric' }).format(today);
      const hijriMonths = [
        'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
        'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Shaban',
        'Ramadan', 'Shawwal', 'Dhu al-Qadah', 'Dhu al-Hijjah'
      ];
      this.hijriDate = `${day} ${hijriMonths[monthNum - 1] || monthNum} ${year.replace(/[^\d]/g, '')} AH`;
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
      if (event && event.target) {
        event.target.complete();
      }
    });
    this.iqamaService.fetchIqamaSchedule().subscribe(rows => {
      this.scheduledChanges = rows;
      this.buildBannerText();
    });
  }

  ionViewWillEnter() {
    this.handleRefresh(null);
  }

  async updateImageBasedOnTime() {
    const currentHour = this.timeService.getNow().getHours();
    this.hourOfDay = currentHour >= 18 ? 'night' : 'day';
  }

  public openMapsApp(address: string) {
    window.location.href = 'https://maps.apple.com/?q=' + encodeURIComponent(address);
  }

  /** Parse "HH:MM AM/PM" or "HH:MM" to a Date object for today */
  private parseTimeToDate(timeStr: string): Date | null {
    if (!timeStr) return null;
    const now = this.timeService.getNow();
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
    const timings = this.httpService.adhans?.data?.timings as any;
    if (!timings) return '';

    if (name === 'lastThird') {
      const maghrib = this.parseTimeToDate(this.formatTime12Hour(timings.Maghrib));
      const fajr = this.parseTimeToDate(this.formatTime12Hour(timings.Fajr));
      if (maghrib && fajr) {
        fajr.setDate(fajr.getDate() + 1);
        const nightMs = fajr.getTime() - maghrib.getTime();
        const lastThirdDate = new Date(maghrib.getTime() + nightMs * (2 / 3));
        return lastThirdDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      }
    }

    const map: Record<string, string> = {
      fajr: timings.Fajr, sunrise: timings.Sunrise,
      dhuhr: timings.Dhuhr, asr: timings.Asr,
      maghrib: timings.Maghrib, isha: timings.Isha,
    };
    return this.formatTime12Hour(map[name]) || '';
  }

  private formatTime12Hour(time: string): string {
    if (!time) return '';
    const [h, m] = time.split(':');
    if (!h || !m) return time;
    let hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${m} ${ampm}`;
  }

  /** Get iqama time for a given prayer */
  getIqamaTime(name: string): string {
    if (name === 'sunrise') return '';
    if (this.isFriday && name === 'dhuhr') return this.iqamaTimes.jummah_1 || '1:45 PM';
    
    // Explicitly calculate Maghrib iqama as 10 minutes after the Aladhan Azan time
    if (name === 'maghrib') {
      const azan = this.getAzanTime('maghrib');
      const date = this.parseTimeToDate(azan);
      if (date) {
        date.setMinutes(date.getMinutes() + 10);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      }
    }

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
    const now = this.timeService.getNow();
    this.isFriday = now.getDay() === 5; // 5 is Friday

    // Automatically fetch new data if the day rolls over at midnight
    if (this.lastFetchedDate !== null && this.lastFetchedDate !== now.getDate()) {
      this.handleRefresh(null);
    }
    this.lastFetchedDate = now.getDate();

    // Update prayer names for Jummah if it's Friday
    if (this.isFriday) {
      this.prayerNames['dhuhr'] = { en: 'Jummah', ar: 'الجمعة' };
    } else {
      this.prayerNames['dhuhr'] = { en: 'Dhuhr', ar: 'الظهر' };
    }

    this.currentTimeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    // Refresh dates periodically (to pick up API data when it arrives)
    this.computeDates();

    // Find current and next prayer
    let currentPrayer = 'isha';
    let nextPrayer = 'fajr';
    let nextDate: Date | null = null;

    for (let i = 0; i < this.prayerOrder.length; i++) {
      const name = this.prayerOrder[i];
      const timeStr = this.getAzanTime(name);

      // Sunrise should be considered "Next" if currently Fajr and it hasn't passed.
      const d = this.parseTimeToDate(timeStr);
      if (d && now < d) {
        nextPrayer = name;
        nextDate = d;

        // If it's before Fajr today, current is Isha (yesterday).
        // If it's after Fajr but before Sunrise, current is Fajr.
        if (i === 0) {
          currentPrayer = 'isha';
        } else {
          currentPrayer = this.prayerOrder[i - 1];
        }
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

  // ==== Simulation Helper Methods ====
  onSimDateChange(event: any): void {
    const val = event.target.value;
    if (val) this.timeService.setSimulatedDate(val);
  }

  onSimTimeChange(event: any): void {
    const val = event.target.value;
    if (val) this.timeService.setSimulatedTime(val);
  }

  /** Build the scrolling banner text from scheduled iqama changes */
  private buildBannerText(): void {
    if (!this.scheduledChanges || this.scheduledChanges.length === 0) {
      this.bannerText = '';
      return;
    }

    const messages = this.scheduledChanges.map(row => {
      const prayerName = this.iqamaService.formatPrayerDisplayName(row.prayer);
      const newTime = this.formatScheduleTime(row.iqamah);
      const dateStr = this.formatScheduleDate(row.effective_date);
      return `🕌 ${prayerName} iqamah will change to ${newTime} on ${dateStr}`;
    });

    // Join all messages with a separator
    this.bannerText = messages.join('       ✦       ');
  }

  /** Convert 24h time ("14:45") to 12h ("2:45 PM") for banner display */
  private formatScheduleTime(time24: string): string {
    if (!time24) return time24;
    const parts = time24.split(':');
    if (parts.length < 2) return time24;
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    if (hours === 0) hours = 12;
    else if (hours > 12) hours -= 12;
    return `${hours}:${minutes} ${ampm}`;
  }

  /** Format "YYYY-MM-DD" into a readable date like "Sunday, April 27" */
  private formatScheduleDate(dateStr: string): string {
    if (!dateStr) return dateStr;
    // Parse as local date (not UTC) by using the parts directly
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  }
}
