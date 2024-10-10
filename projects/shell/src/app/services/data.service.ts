import { HttpClient, HttpEventType, HttpHeaders, HttpRequest } from "@angular/common/http";
import { Inject, inject, Injectable } from "@angular/core";
import { map } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class DataService {

    private http = inject(HttpClient);

    constructor(
        @Inject("SERVICE_BASE_URL") private baseUrl: string
    ) {

    }

    getUserProfile(whatsappNumber: string) {
        return this.getDataLike("get_profile_for_whats_app_no", whatsappNumber);
    }

    getStudentsForProfile(profileId: string) {
        return this.getDataLike("get_students_for_profile_id", profileId);
    }

    private getDataLike(module: string, id: string) {
        const result = this.getRequest<string[]>(
            `${this.baseUrl}/get_data_like?module=${module}&id=${encodeURIComponent(id)}`
        );
        if (result === null) return result;

        return result.pipe(
            map(items => {
                if (!items) return null;
                else return (items as string[]).map((row: string) => JSON.parse(row));
            })
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

    addModule (module: string, payload: any) {
        return this.postRequest(
            `${this.baseUrl}/add?module=${module}`,
            {
                module,
                json_request: payload
            }
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