import { Component, effect, inject, signal } from '@angular/core';
import { MenuItem, MenuItemCommandEvent } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { UserStore } from '../../services/user.store';
import { CreateWorksheetComponent } from '../admin/create-worksheet/create-worksheet.component';

@Component({
  selector: 'admin-dashboard',
  standalone: true,
  imports: [MenuModule, CreateWorksheetComponent],
  providers: [UserStore],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboard {
  userStore = inject(UserStore);
  adminTabs: MenuItem[] | undefined;
  selectedMenu = signal<MenuItem | null>(null);
  menuComponentMap = new Map([
    ['Course Master', '<div />'],
    ['Create Worksheet', '<create-worksheet />']
  ])

  constructor() {
  }

  ngOnInit() {
    this.adminTabs = [
      { label: 'Course Master' },
      { label: 'Course Topic Master' },
      { label: 'Profile Settings' },
      { label: 'Students Master' },
      { label: 'Student Topic Completion' },
      { label: 'Student Attendance' },
      {
        label: 'Create Worksheet',
        command: (event) => this.loadAdminModule(event)
      },
      { label: 'Create Questions and Answers' },
      { label: 'Student Worksheet Assignment' }
    ]
  }

  loadAdminModule (event: MenuItemCommandEvent) {
    this.selectedMenu.set(event.item as MenuItem);
  }
}
