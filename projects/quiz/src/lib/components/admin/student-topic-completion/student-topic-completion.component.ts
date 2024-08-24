import { Component, effect, signal } from "@angular/core";
import { formatDate } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { catchError, finalize, tap } from "rxjs";
import { MessageService } from "primeng/api";
import { CalendarModule } from 'primeng/calendar';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from "primeng/dropdown";
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DataService } from "../../../services/data.service";
import { Student, StudentTopic, Topic } from "../../../../models/model";
import { ButtonModule } from "primeng/button";
import { ADD_STUDNET_TOPIC, GET_ALL_ACTIVE_STUDENTS, GET_PENDING_TOPIC_FOR_STUDENT } from "../../../constants/api-module-names";

@Component({
  selector: 'student-topic-completion',
  standalone: true,
  imports: [
    ButtonModule, TableModule, ProgressSpinnerModule,
    ToastModule, DropdownModule, FormsModule,
    InputTextareaModule, CalendarModule
  ],
  providers: [MessageService],
  templateUrl: './student-topic-completion.component.html',
  styleUrl: './student-topic-completion.component.css'
})
export class StudentTopicCompletionComponent {
  showLoader: boolean = false;
  students: Student[] = [];
  selectedStudentId = signal<number>(-1);
  selectedStudent: Student | null = null;
  pendingTopics: StudentTopic[] = [];

  constructor(
    private dataService: DataService,
    private messageService: MessageService
  ) {
    this.showLoader = true;
    this.dataService.getAllInfo(GET_ALL_ACTIVE_STUDENTS).pipe(
      tap(result => {
        if (!result?.length) return;
        this.students = result;
      }),
      catchError(error => {
        console.error('Error in StudentTopicCompletionComponent getAllActiveStudents: ', error.message);
        throw error;
      }),
      finalize(() => this.showLoader = false)
    ).subscribe();

    effect(() => {
      if (this.selectedStudentId() === -1) return;
      this.selectedStudent = this.students.find(student => student.id === this.selectedStudentId()) || null;
      this.getPendingTopicForStudent();
    })
  }

  getPendingTopicForStudent () {
    this.showLoader = true;
    this.dataService.getDataForId(GET_PENDING_TOPIC_FOR_STUDENT, this.selectedStudentId()).pipe(
      tap(result => {
        if (!result?.length) return;
        this.pendingTopics = result.map((topic, index) => {
          return {
            student_id: this.selectedStudentId(),
            topic_id: topic.id as number,
            completion_date: null,
            remarks: "",
            id: index,
            name: topic.name
          }
        });
      }),
      catchError(error => {
        console.error('Error in StudentTopicCompletionComponent getPendingTopicForStudent: ', error.message);
        throw error;
      }),
      finalize(() => this.showLoader = false)
    ).subscribe()
  }

  markTopicsAsComplete () {
    const dataToSave = this.pendingTopics.filter(topic => !!topic.completion_date)
      .map(topic => {
        const { id, name, completion_date: completionDate, ...rest } = topic;
        return { ...rest, completion_date: formatDate(completionDate || new Date(), "YYYY-MM-dd", "en-US") };
      })
    if (!dataToSave?.length) return;
    this.showLoader = true;
    this.dataService.addModule(ADD_STUDNET_TOPIC, dataToSave).pipe(
      tap((result: any) => {
        if (!result) return;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: result
        });
      }),
      catchError(error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message
        });
        throw error;
      }),
      finalize(() => {
        this.showLoader = false;
        this.getPendingTopicForStudent();
      })
    ).subscribe();
  }
}
