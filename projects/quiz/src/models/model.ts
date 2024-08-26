export interface GeneralQuestion {
    worksheet_id: number;
    id: number;
    content: string;
    type: string;
    general_question_options?: GeneralQuestionOption[]
}

export interface QRDivisionQuestion {
    worksheet_id: number;
    id: number;
    content: string;
    quotient: string;
    reminder: string;
    type: string;
}

export interface QRDivisionResult {
    student_worksheet_id: number;
    id: number;
    qr_question_id: number;
    quotient_provided: string;
    reminder_provided: string;
    is_quotient_correct: 0 | 1;
    is_reminder_correct: 0 | 1;
    duration_seconds: number;
}

export interface GeneralQuestionOption {
    id: number;
    general_question_id: number;
    content: string;
    is_correct: 0 | 1;
    canDelete?: boolean;
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
    GeneralQuestions?: GeneralQuestion[];
    QR_Division_Questions?: QRDivisionQuestion[],
    student_worksheet_id?: number;
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
    assigned_date: Date | string | null;
    status: string;
    start_time?: Date | string;
    end_time?: Date | string;
    duration_seconds?: number;
    name?: string;
}