import { HttpClient, HttpEventType, HttpHeaders, HttpRequest } from "@angular/common/http";
import { Inject, inject, Injectable } from "@angular/core";
import { Answer, GeneralQuestion, GeneralQuestionOption, Question, Quiz, Student, Worksheet } from "../../models/model";
import { map, tap } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class DataService {

    private http = inject(HttpClient);

    constructor(
        @Inject("SERVICE_BASE_URL") private baseUrl: string,
        @Inject("FASTAPI_BASE_URL") private fastApiUrl: string
    ) {

    }

    getUserProfile(whatsappNumber: string) {
        return this.getRequest<string[]>(
            `${this.fastApiUrl}/get_data_like?module=get_profile_for_whats_app_no&id=${encodeURIComponent(whatsappNumber)}`
        );
    }

    getPendingTopicsForStudent (studentId: number) {
        const result = this.getRequest<string[]>(
            `${this.fastApiUrl}/get_data_for_id?module=get_pending_topic_for_student&id=${studentId}`
        );
        if (result === null) return result;

        return result.pipe(
            map(items => {
                if (!items) return null;
                else return (items as string[]).map((row: string) => JSON.parse(row));
            })
        );        
    }
    
    getQuizzes() {
        return this.getRequest<Quiz[]>(`${this.baseUrl}/quizzes`);
    }

    getQuiz(id: number) {
        return this.getRequest<{
            questions: Question[],
            answers: Answer[]
        }>(`${this.baseUrl}/quiz/${id}`)
    }

    getAllWorksheets () {
        const result = this.getRequest<string[]>(`${this.fastApiUrl}/GetAllInfo?module=get_all_worksheets`);
        if (!result) return result;
        return result.pipe(
            map(items => {
                if (!items) return null;
                else return (items as string[]).map((row: string) => JSON.parse(row));
            })
        );   
    }

    getWorksheetById (worksheetId: number) {
        const result = this.getRequest<string[]>(`${this.fastApiUrl}/worksheet/${worksheetId}`);
        if (!result) return result;
        return result.pipe(tap(items => items));   
    }

    addWorksheet(worksheet: Worksheet) {
        const { id, ...rest } = worksheet;
        return this.postRequest(
            `${this.fastApiUrl}/add?module=add_worksheet`,
            {
                module: "add_worksheet",
                json_request: [
                    { ...rest }
                ]
            }
        );
    }

    addGeneralQuestion(question: GeneralQuestion) {
        const { id, ...rest } = question;
        return this.postRequest(
            `${this.fastApiUrl}/add?module=add_general_question`,
            {
                module: "add_general_question",
                json_request: [
                    { ...rest }
                ]
            }
        );
    }

    addAnswerOptions(options: GeneralQuestionOption[]) {
        if (!options?.length) return;
        const optionsWithoutId = options.map(option => {
            const { id, ...rest } = option || {};
            return rest;
        })
        return this.postRequest(
            `${this.fastApiUrl}/add?module=add_question_option`,
            {
                module: "add_question_option",
                json_request: optionsWithoutId
            }
        );
    }

    private getRequest<T>(url: string, payload: any = null) {
        const request = new HttpRequest("GET", url, payload);
        return this.http.request<T>(request).pipe(
            map(event => {
                if(event.type == HttpEventType.Response) {
                    return event.body;
                }
                return null;
            })
        );
    }

    private postRequest(url: string, payload: any = null) {
        const request = new HttpRequest("POST", url, payload);
        return this.http.request(request).pipe(
            map(event => {
                if(event.type == HttpEventType.Response && event.status === 200) {
                    return event.body;
                }
                return null;
            })
        )
    }
}