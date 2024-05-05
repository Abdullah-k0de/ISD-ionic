export class HadithClass {
    id: string
    title: string
    hadeeth: string = "Default Hadith...Plz work";
    attribution: string
    grade: string
    explanation: string = "Default Explanation";
    hints: any[]
    categories: string[]
    translations: string[]
    hadeeth_ar: string = "Default arabic hadith";
    explanation_ar: string = "Default arabic explanation"
    hints_ar: string[]
    words_meanings_ar: WordsMeaningsAr[]
    attribution_ar: string
    grade_ar: string
}

export interface WordsMeaningsAr {
    word: string
    meaning: string
}
  