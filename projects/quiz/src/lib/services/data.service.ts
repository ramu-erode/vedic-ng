import { HttpClient, HttpEventType, HttpRequest } from "@angular/common/http";
import { Inject, inject, Injectable } from "@angular/core";
import { GeneralQuestionOption, Worksheet } from "../../models/model";
import { map, tap } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class DataService {

    private http = inject(HttpClient);

    constructor(
        @Inject("SERVICE_BASE_URL") private baseUrl: string
    ) {

    }

    getDataForId (module: string, id: number) {
        const result = this.getRequest<string[]>(
            `${this.baseUrl}/get_data_for_id?module=${module}&id=${id}`
        );
        if (result === null) return result;

        return result.pipe(
            map(items => {
                if (!items) return null;
                else return (items as string[]).map((row: string) => JSON.parse(row));
            })
        );        
    }

    getAllInfo (module: string) {
        const result = this.getRequest<string[]>(`${this.baseUrl}/GetAllInfo?module=${module}`);
        if (!result) return result;
        return result.pipe(
            map(items => {
                if (!items) return null;
                else return (items as string[]).map((row: string) => JSON.parse(row));
            })
        );   
    }

    getWorksheetById (worksheetId: number) {
        const result = this.getRequest<Worksheet>(`${this.baseUrl}/worksheet/${worksheetId}`);
        if (!result) return result;
        return result.pipe(tap(items => items));
    }

    addAnswerOptions (options: GeneralQuestionOption[]) {
        const optionsWithoutId = options.map(option => {
            const { id, ...rest } = option || {};
            return rest;
        })
        return this.postRequest(
            `${this.baseUrl}/add?module=add_question_option`,
            {
                module: "add_question_option",
                json_request: optionsWithoutId
            }
        );
    }

    addModule (module: string, payload: any) {
        return this.postRequest(
            `${this.baseUrl}/add?module=${module}`,
            {
                module,
                json_request: payload
            }
        );
    }

    deleteModule (module: string, payload: any) {
        return this.deleteRequest(
            `${this.baseUrl}/delete?module=${module}`,
            {
                module,
                json_request: payload
            }
        );
    }

    getDataForEdit (module: string, id: number) {
        return this.postRequest(
            `${this.baseUrl}/data_for_edit?module=${module}`,
            {
                module,
                json_request: { id }
            }
        );
    }

    editData (module: string, payload: any) {
        return this.postRequest(
            `${this.baseUrl}/edit?module=${module}`,
            {
                module,
                json_request: payload
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

    private deleteRequest(url: string, payload: any) {
        return this.http.delete(url, { body: payload }).pipe(
            map((event: any) => {
                if(event.type == HttpEventType.Response && event.status === 200) {
                    return event.body;
                }
                return null;
            })
        )
    }
}