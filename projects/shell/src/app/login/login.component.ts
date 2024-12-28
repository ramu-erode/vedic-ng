import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Message } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { AuthenticationService } from '../services/AuthenticationService';
import { ButtonModule } from 'primeng/button';
import { MessagesModule } from 'primeng/messages';
import { catchError, tap } from 'rxjs';
import { UserStore } from '../services/user.store';
import { Router } from '@angular/router';

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


  constructor (private authService: AuthenticationService, private router: Router) {
  }

  onSubmit () {
    if (!this.whatsappNumber) return;

    this.authService.login(this.whatsappNumber).pipe(
      catchError(error => {
        console.error(`Error when logging in: ${error.message}`);
        this.messages = [{ severity: 'error', detail: 'Login failed' }];
        throw error;
      })
    ).subscribe(result => {
      if (!result) {
        this.messages = [{ severity: 'error', detail: 'Login failed' }];
        return;
      }
      if (result?.role_id === 1) this.router.navigate(['/admin-dashboard']);
      else this.router.navigate(['/students']);
      this.userStore.setUserProfile(this.whatsappNumber);
    });
  }
}
