import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { catchError, tap } from 'rxjs';
import { Message } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { AuthenticationService } from '../services/AuthenticationService';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { UserStore } from '@vedic/shell';
import { CheckboxChangeEvent, CheckboxModule } from 'primeng/checkbox';
import { MessagesModule } from 'primeng/messages';

@Component({
  selector: 'vedic-shell-signup',
  standalone: true,
  imports: [
    FormsModule, InputTextModule, ReactiveFormsModule, ButtonModule,
    CheckboxModule, MessagesModule
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  whatsappNumber: string = "";
  name: string = "";
  roleId: 1 | 2 = 2;
  isActive: 0 | 1 = 1;
  messages: Message[] = [];
  userStore = inject(UserStore);

  constructor (private authService: AuthenticationService, private router: Router) {
  }

  setIsAdmin (event: CheckboxChangeEvent) {
    this.roleId = event.checked ? 1 : 2;
  }

  getFormattedWhatsappNumber () {
    if (this.whatsappNumber.startsWith("+91") && this.whatsappNumber.length === 13) {
      return this.whatsappNumber;
    }
    if (this.whatsappNumber.length === 10) {
      return `+91${this.whatsappNumber}`;
    }
    return ''
  }
  
  onSubmit () {
    const formattedNumber = this.getFormattedWhatsappNumber();
    if (!formattedNumber) {
      this.messages = [{ severity: 'error', detail: 'Incorrect whatsapp number' }];
      return;
    }

    const profile = {
      name: this.name,
      whats_app_no: formattedNumber,
      is_active: this.isActive,
      role_id: this.roleId
    }
    this.authService.signup(profile).pipe(
      catchError(error => {
        console.error(`Error when signing up: ${error.message}`);
        this.messages = [{ severity: 'error', detail: 'Signup failed' }];
        throw error;
      })
    ).subscribe(result => {
      if (!result) {
        this.messages = [{ severity: 'error', detail: 'Login failed' }];
        return;
      }
      if (profile.role_id === 1) this.router.navigate(['/admin-dashboard']);
      else this.router.navigate(['/students']);
      this.userStore.setUserProfile(this.whatsappNumber);
    });
  }
}
