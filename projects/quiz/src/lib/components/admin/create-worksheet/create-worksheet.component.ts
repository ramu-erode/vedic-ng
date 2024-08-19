import { Component, signal } from '@angular/core';
import { catchError, tap } from 'rxjs';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DataService } from '../../../services/data.service';
import { Topic, Worksheet } from '../../../../models/model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'create-worksheet',
  standalone: true,
  imports: [
    ButtonModule, CheckboxModule, DropdownModule, InputTextModule,
    FormsModule, ReactiveFormsModule, ToastModule
  ],
  templateUrl: './create-worksheet.component.html',
  styleUrl: './../admin.component.css',
  providers: [MessageService]
})
export class CreateWorksheetComponent {
  types = [
    'General',
    'Table',
    'QRDivision'
  ]
  topics = signal<Topic[] | []>([]);
  worksheet = signal<Worksheet>({
    id: 0,
    topic_id: -1,
    name: '',
    type: '',
    table_of: '',
    is_practice: false
  });

  constructor (
    private dataService: DataService,
    private messageService: MessageService
  ) {
    this.dataService.getPendingTopicsForStudent(1).subscribe(result => {
      this.topics.set(result || []);
    })
  }

  resetValues () {
    this.worksheet.set({
      id: 0,
      topic_id: -1,
      name: '',
      type: '',
      table_of: '',
      is_practice: false
    });
  }

  submitValues () {
    this.dataService.addWorksheet(this.worksheet()).pipe(
      tap((result: any) => {
        if (!result || result.type === 0) return;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: result?.toString()
        });
        this.resetValues();
      }),
      catchError(error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message
        });
        throw error;
      })
    ).subscribe();
  }
}
