export class SurahList {
    code: number
    status: string
    data: Daum[]
  }
  
  export interface Daum {
    number: number
    name: string
    englishName: string
    englishNameTranslation: string
    numberOfAyahs: number
    revelationType: string
  }