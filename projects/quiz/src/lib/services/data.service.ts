import { HttpClient, HttpEventType, HttpRequest } from "@angular/common/http";
import { Inject, inject, Injectable } from "@angular/core";
import { Answer, Profile, Question, Quiz } from "../../models/model";
import { map } from "rxjs";

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
        return this.getRequest<Profile>(
            `${this.baseUrl}/profile`, { whatsappNumber }
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
}