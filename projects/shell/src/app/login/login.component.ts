import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Message } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { AuthenticationService } from '../services/AuthenticationService';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessagesModule } from 'primeng/messages';
import { catchError, tap } from 'rxjs';
import { UserStore } from '../services/user.store';

@Component({
  selector: 'vedic-shell-login',
  standalone: true,
  imports: [
    FormsModule, InputTextModule, ReactiveFormsModule, ButtonModule, MessagesModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  userStore = inject(UserStore);
  whatsappNumber: string = "";
  messages: Message[] = [];

  constructor (private authService: AuthenticationService) {
  }

  onSubmit () {
    if (!this.whatsappNumber) return;

    this.authService.login(this.whatsappNumber).pipe(
      tap(result => { 
        if (!result) {
          this.messages = [{ severity: 'error', detail: 'Login failed' }];
          return;
        }
        this.userStore.setUserProfile(this.whatsappNumber);
      }),
      catchError(error => {
        console.error(`Error when logging in: ${error.message}`);
        this.messages = [{ severity: 'error', detail: 'Login failed' }];
        throw error;
      })
    ).subscribe();
  }
}
