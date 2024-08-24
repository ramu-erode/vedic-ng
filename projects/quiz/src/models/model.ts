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
    type: string;
    general_question_options?: GeneralQuestionOption[] | string[]
}

export interface GeneralQuestionOption {
    id: number;
    general_question_id: number;
    content: string;
    is_correct: 0 | 1;
    canDelete?: boolean;
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
    table_of: string | null;
    is_practice: 0 | 1;
}

export interface EditFields {
    field_name: string;
    field_type: string;
    field_value: any;
}

export interface StudentTopic {
    student_id: number;
    topic_id: number;
    completion_date: Date | null;
    remarks: string;
    id: number;
    name?: string;
}

export interface StudentWorksheet {
    id: number;
    student_id: number;
    worksheet_id: number;
    assigned_date: Date | null;
    status: string;
    start_time?: Date;
    end_time?: Date;
    duration_seconds?: number;
    name?: string;
}