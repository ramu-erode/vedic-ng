import { Component, effect, inject, signal } from '@angular/core';
import { UserStore } from '../../services/user.store';

@Component({
  selector: 'admin-dashboard',
  standalone: true,
  imports: [],
  providers: [UserStore],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboard {
  userStore = inject(UserStore);

  constructor() {
  }
}
