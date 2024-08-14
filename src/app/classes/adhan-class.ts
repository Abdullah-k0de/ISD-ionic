export class AdhanClass {
  status: string
  data: Data
  message: any[]
}

export interface Data {
  salah: Salah[]
  iqamah: Iqamah[]
}

export interface Salah {
  date: string
  hijri_date: string
  hijri_month: string
  day: string
  fajr: string
  sunrise: string
  zuhr: string
  asr: string
  maghrib: string
  isha: string
}

export interface Iqamah {
  date: string
  fajr: string
  zuhr: string
  asr: string
  maghrib: string
  isha: string
  jummah1: string
  jummah2: string
}