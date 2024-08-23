import { Component, effect, inject, signal } from '@angular/core';
import { MenuItem, MenuItemCommandEvent } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { UserStore } from '../../services/user.store';
import { CreateWorksheetComponent } from '../admin/worksheets/create-worksheet.component';
import {
  COURSE_MASTER, COURSE_TOPIC_MASTER, QUESTIONS_AND_ANSWERS, WORKSHEETS,
  PROFILE_SETTINGS, STUDENT_ATTENDANCE, STUDENT_TOPIC_COMPLETION,
  STUDENT_WORKSHEET_ASSIGNMENT, STUDENTS_MASTER
} from '../../constants/admin-menu-items';
import { AddQuestionsAnswersComponent } from '../admin/questions-answers/add-questions-answers.component';
import { WorksheetsComponent } from '../admin/worksheets/worksheets.component';
import { Worksheet } from '../../../models/model';
import { QuestionsComponent } from '../admin/questions-answers/questions.component';

@Component({
  selector: 'admin-dashboard',
  standalone: true,
  imports: [
    MenuModule, CreateWorksheetComponent, AddQuestionsAnswersComponent, WorksheetsComponent,
    QuestionsComponent
  ],
  providers: [UserStore],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboard {
  userStore = inject(UserStore);
  adminTabs: MenuItem[] | undefined;
  selectedMenu = signal<MenuItem | null>(null);
  worksheets = WORKSHEETS;
  questionsAnswers = QUESTIONS_AND_ANSWERS;

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
        label: this.worksheets,
        command: (event) => this.loadAdminModule(event)
      },
      {
        label: this.questionsAnswers,
        command: (event) => this.loadAdminModule(event)
      },
      { label: STUDENT_WORKSHEET_ASSIGNMENT }
    ]
  }

  loadAdminModule (event: MenuItemCommandEvent) {
    this.selectedMenu.set(event.item as MenuItem);
  }
}
