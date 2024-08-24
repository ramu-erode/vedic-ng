import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { AuthenticationService } from '../services/AuthenticationService';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'vedic-shell-signup',
  standalone: true,
  imports: [FormsModule, InputTextModule, ReactiveFormsModule, ButtonModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  whatsappNumber: string = "";

  constructor (private authService: AuthenticationService, private router: Router) {
  }
  
  onSubmit () {

  }
}
