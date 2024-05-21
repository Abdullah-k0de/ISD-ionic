export class HadithClass {
    id: string
    title: string
    hadeeth: string;
    attribution: string
    grade: string
    explanation: string;
    hints: any[]
    categories: string[]
    translations: string[]
    hadeeth_ar: string;
    explanation_ar: string
    hints_ar: string[]
    words_meanings_ar: WordsMeaningsAr[]
    attribution_ar: string
    grade_ar: string

    constructor(userHadeeth: string, userExplanation: string, userHadeeth_ar: string, userExplanation_ar: string, userGrade: string, userAttribute: string){
        this.hadeeth = userHadeeth;
        this.explanation = userExplanation;
        this.hadeeth_ar = userHadeeth_ar;
        this.explanation_ar = userExplanation_ar;
        this.attribution = userAttribute;
        this.grade = userGrade;
    }
}

export interface WordsMeaningsAr {
    word: string
    meaning: string
}
