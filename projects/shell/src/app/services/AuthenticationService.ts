import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ADD_PROFILE } from '../../../../quiz/src/lib/constants/api-module-names';
import { Profile } from '@vedic/shell';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private whatsappNumber: string = "";

  constructor(
    private router : Router,
    private dataService: DataService
  ) {
    const lsWhatsapp = localStorage.getItem("authenticatedUser");
    if (!lsWhatsapp) return;
    this.whatsappNumber = lsWhatsapp;
  }

  login<T>(whatsappNumber: string) {
    /* getUserProfile() is used for both authentication and authorization for time being.
    In future, when a proper authentication service is in place, we will replace the getUserProfile()
    here with that proper function. */
    return this.dataService.getUserProfile(whatsappNumber).pipe(
      tap(result => {
        if (!result?.length || result[0] === "") {
          return null;
        }
        this.whatsappNumber = whatsappNumber;
        localStorage.setItem("authenticatedUser", whatsappNumber);
        return JSON.parse(result[0]);
      }),
      catchError(error => {
        console.error('Error in getUserProfile: ', error.message);
        throw error;
      }),
    );  
  }

  signup (profile: { name: string, whats_app_no: string, is_active: 0 | 1, role_id: 1 | 2 }) {
    return this.dataService.addModule(ADD_PROFILE, [profile]).pipe(
      tap(result => {
        if (!result) {
          return null;
        }
        this.whatsappNumber = profile.whats_app_no;
        localStorage.setItem("authenticatedUser", profile.whats_app_no);
        return result;
      }),
      catchError(error => {
        console.error('Error in getUserProfile: ', error.message);
        throw error;
      }),
    );  
  }

  isAuthenticatedUser (): boolean {
    const lsWhatsapp = localStorage.getItem("authenticatedUser");
    if (!lsWhatsapp) return false;
    return true;
  }

  logout() {
    localStorage.removeItem("authenticatedUser");
    this.router.navigate(['/login']);
  }
}