export class AdhanClass {
    code: number
  status: string
  data: Data
}

export interface Data {
  timings: timings
  date: Date
  meta: Meta
}

export class timings {
  Fajr: string = "00:00 AM"
  Sunrise: string
  Dhuhr: string
  Asr: string
  Sunset: string
  Maghrib: string
  Isha: string
  Imsak: string
  Midnight: string
  Firstthird: string
  Lastthird: string
}

export interface Date {
  readable: string
  timestamp: string
  hijri: Hijri
  gregorian: Gregorian
}

export interface Hijri {
  date: string
  format: string
  day: string
  weekday: Weekday
  month: Month
  year: string
  designation: Designation
  holidays: any[]
}

export interface Weekday {
  en: string
  ar: string
}

export interface Month {
  number: number
  en: string
  ar: string
}

export interface Designation {
  abbreviated: string
  expanded: string
}

export interface Gregorian {
  date: string
  format: string
  day: string
  weekday: Weekday2
  month: Month2
  year: string
  designation: Designation2
}

export interface Weekday2 {
  en: string
}

export interface Month2 {
  number: number
  en: string
}

export interface Designation2 {
  abbreviated: string
  expanded: string
}

export interface Meta {
  latitude: number
  longitude: number
  timezone: string
  method: Method
  latitudeAdjustmentMethod: string
  midnightMode: string
  school: string
  offset: Offset
}

export interface Method {
  id: number
  name: string
  params: Params
  location: Location
}

export interface Params {
  Fajr: number
  Isha: number
}

export interface Location {
  latitude: number
  longitude: number
}

export interface Offset {
  Imsak: number
  Fajr: number
  Sunrise: number
  Dhuhr: number
  Asr: number
  Maghrib: number
  Sunset: number
  Isha: number
  Midnight: number
}
