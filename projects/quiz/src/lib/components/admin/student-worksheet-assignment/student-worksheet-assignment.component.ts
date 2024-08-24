import { Component, effect, signal } from '@angular/core';
import { formatDate } from '@angular/common';
import { catchError, finalize, tap } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { DataService } from '../../../services/data.service';
import { StudentWorksheet } from '../../../../models/model';
import { Student } from "@vedic/shell";
import { ADD_STUDENT_WORKSHEET, GET_ALL_ACTIVE_STUDENTS, GET_UNASSIGNED_WORKSHEETS } from '../../../constants/api-module-names';

@Component({
  selector: 'student-worksheet-assignment',
  standalone: true,
  imports: [
    ButtonModule, TableModule, ProgressSpinnerModule,
    ToastModule, DropdownModule, FormsModule
  ],
  providers: [MessageService],
  templateUrl: './student-worksheet-assignment.component.html',
  styleUrl: './student-worksheet-assignment.component.css'
})
export class StudentWorksheetAssignmentComponent {
  showLoader: boolean = false;
  students: Student[] = [];
  selectedStudentId = signal<number>(-1);
  selectedStudent: Student | null = null;
  unassignedWorksheets: StudentWorksheet[] = [];
  selectedWorksheets: StudentWorksheet[] = [];

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
        console.error('Error in StudentWorksheetAssignmentComponent getAllActiveStudents: ', error.message);
        throw error;
      }),
      finalize(() => this.showLoader = false)
    ).subscribe();

    effect(() => {
      if (this.selectedStudentId() === -1) return;
      this.selectedStudent = this.students.find(student => student.id === this.selectedStudentId()) || null;
      this.getUnassignedWorksheets();
    })
  }

  getUnassignedWorksheets () {
    this.showLoader = true;
    this.dataService.getDataForId(GET_UNASSIGNED_WORKSHEETS, this.selectedStudentId()).pipe(
      tap(result => {
        if (!result?.length) return;
        this.unassignedWorksheets = result.map((worksheet, index) => {
          return {
            student_id: this.selectedStudentId(),
            worksheet_id: worksheet.id as number,
            assigned_date: null,
            status: "",
            id: index,
            name: worksheet.name
          }
        });
      }),
      catchError(error => {
        console.error('Error in StudentWorksheetAssignmentComponent getUnassignedWorksheets: ', error.message);
        throw error;
      }),
      finalize(() => this.showLoader = false)
    ).subscribe()
  }

  assignWorksheets () {
    const dataToSave = this.selectedWorksheets.map(worksheet => {
        const { student_id, worksheet_id } = worksheet;
        return {
          student_id, worksheet_id,
          assigned_date: formatDate(new Date(), "YYYY-MM-dd", "en-US"),
          status: "assigned"
        };
      })
      if (!dataToSave?.length) return;
    this.showLoader = true;
    this.dataService.addModule(ADD_STUDENT_WORKSHEET, dataToSave).pipe(
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
        this.getUnassignedWorksheets();
      })
    ).subscribe();
  }
}
