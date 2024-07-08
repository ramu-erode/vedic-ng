export interface Quiz {
    id: number;
    title: string;
}

export interface Question {
    id: number;
    quizId: number;
    content: string;
    type: string;
}

export interface Answer {
    id: number;
    questionId: number;
    content: string;
    isCorrect: boolean;
}