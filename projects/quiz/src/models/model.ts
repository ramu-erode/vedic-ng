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

export interface GeneralQuestion {
    worksheet_id: number;
    id: number;
    content: string;
    type: string
}

export interface GeneralQuestionOption {
    id: number;
    general_question_id: number;
    content: string;
    is_correct: boolean;
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

export interface Student {
    id: number;
    profile_id: number;
    name: string;
    date_of_birth: Date;
    class: string;
    class_in_year: string;
    is_active: boolean;
}

export interface Topic {
    id: number;
    course_id: number;
    name: string;
    sequence: number;
}

export interface Worksheet {
    id: number;
    topic_id: number;
    name: string;
    type: string;
    table_of: string;
    is_practice: boolean;
}