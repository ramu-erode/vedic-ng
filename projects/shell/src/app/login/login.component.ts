import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Message } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { AuthenticationService } from '../services/AuthenticationService';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessagesModule } from 'primeng/messages';
import { catchError, tap } from 'rxjs';

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
  whatsappNumber: string = "";
  messages: Message[] = [];

  constructor (private authService: AuthenticationService, private router: Router) {
  }

  onSubmit () {
    if (!this.whatsappNumber) return;

    this.authService.login(this.whatsappNumber).pipe(
      tap(result => { 
        if (!result) {
          this.messages = [{ severity: 'error', detail: 'Login failed' }];
          return;
        }
        this.router.navigate(['/admin-dashboard']);
      }),
      catchError(error => {
        console.error(`Error when logging in: ${error.message}`);
        this.messages = [{ severity: 'error', detail: 'Login failed' }];
        throw error;
      })
    ).subscribe();
  }
}
