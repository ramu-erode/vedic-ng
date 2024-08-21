import { Component, effect, inject, signal } from '@angular/core';
import { MenuItem, MenuItemCommandEvent } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { UserStore } from '../../services/user.store';
import { CreateWorksheetComponent } from '../admin/create-worksheet/create-worksheet.component';
import {
  COURSE_MASTER, COURSE_TOPIC_MASTER, CREATE_QUESTIONS_AND_ANSWERS, CREATE_WORKSHEET,
  PROFILE_SETTINGS, STUDENT_ATTENDANCE, STUDENT_TOPIC_COMPLETION,
  STUDENT_WORKSHEET_ASSIGNMENT, STUDENTS_MASTER
} from '../../constants/admin-menu-items';
import { AddQuestionsAnswersComponent } from '../admin/add-questions-answers/add-questions-answers.component';

@Component({
  selector: 'admin-dashboard',
  standalone: true,
  imports: [MenuModule, CreateWorksheetComponent, AddQuestionsAnswersComponent],
  providers: [UserStore],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboard {
  userStore = inject(UserStore);
  adminTabs: MenuItem[] | undefined;
  selectedMenu = signal<MenuItem | null>(null);
  createWorksheet = CREATE_WORKSHEET;
  createQuestionsAnswers = CREATE_QUESTIONS_AND_ANSWERS;

  constructor() {
  }

  ngOnInit() {
    this.adminTabs = [
      { label: COURSE_MASTER },
      { label: COURSE_TOPIC_MASTER },
      { label: PROFILE_SETTINGS },
      { label: STUDENTS_MASTER },
      { label: STUDENT_TOPIC_COMPLETION },
      { label: STUDENT_ATTENDANCE },
      {
        label: this.createWorksheet,
        command: (event) => this.loadAdminModule(event)
      },
      {
        label: this.createQuestionsAnswers,
        command: (event) => this.loadAdminModule(event)
      },
      { label: STUDENT_WORKSHEET_ASSIGNMENT }
    ]
  }

  loadAdminModule (event: MenuItemCommandEvent) {
    this.selectedMenu.set(event.item as MenuItem);
  }
}
