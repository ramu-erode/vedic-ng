import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private isAuthenticated = false;
  private whatsappNumber: string = "";

  constructor(
    private router : Router,
    private dataService: DataService
  ) {
    const lsWhatsapp = localStorage.getItem("authenticatedUser");
    if (!lsWhatsapp) return;

    this.whatsappNumber = lsWhatsapp;
    this.isAuthenticated = true;
  }

  login<T>(whatsappNumber: string) {
    return this.dataService.getUserProfile(whatsappNumber).pipe(
      tap(result => {
        if (!result?.length || result[0] === "") {
          this.isAuthenticated = false;
          return null;
        }
        this.isAuthenticated = true;
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

  isAuthenticatedUser (): boolean {
    if (!this.whatsappNumber) return false;
    return this.isAuthenticated;
  }

  getLoggedInUserNumber () {
    return this.whatsappNumber;
  }

  logout() {
    localStorage.removeItem("authenticatedUser");
    this.isAuthenticated = false;
    this.router.navigate(['/login']);
  }
}