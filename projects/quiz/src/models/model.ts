export interface Quiz {
    id: number;
    title: string;
}

export interface Question {
    id: number;
    quizId: number;
    content: string;
    type: string
}

export interface Answer {
    id: number;
    questionId: number;
    content: string;
    isCorrect: boolean;
}

export interface DodgingTableRow {
    label: string;
    intermediates: Array<{ rowId: string, columnId: string, value: number }>;
    answer: number
}

export interface Profile {
    id: number;
    name: string;
    whats_app_no: string,
    role_id: number
}