export class AdhanClass {
  code?: number;
  status?: string;
  data?: Data;
}

export interface Data {
  timings?: Timings;
  date?: any;
  meta?: any;
}

export interface Timings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
  Midnight: string;
  Firstthird: string;
  Lastthird: string;
}