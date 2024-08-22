import { Component, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { catchError, tap } from 'rxjs';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataService } from '../../../services/data.service';
import { GeneralQuestion, GeneralQuestionOption, Worksheet } from '../../../../models/model';
import { GeneralQuestionOptionComponent } from './general-question-option.component';

@Component({
  selector: 'add-questions-answers',
  standalone: true,
  imports: [
    ButtonModule, CheckboxModule, DropdownModule, InputTextModule, CommonModule,
    FormsModule, ReactiveFormsModule, ToastModule, GeneralQuestionOptionComponent
  ],
  providers: [MessageService],
  templateUrl: './add-questions-answers.component.html',
  styleUrl: './../admin.component.css'
})
export class AddQuestionsAnswersComponent {
  worksheets = signal<Worksheet[]>([]);
  question = signal<GeneralQuestion>({
    id: 0,
    worksheet_id: 0,
    content: '',
    type: ''
  });
  types = [
    "General",
    "radio",
  ];
  answerOptions = signal<GeneralQuestionOption[]>([]);

  constructor (
    private dataService: DataService,
    private messageService: MessageService
  ) {
    this.dataService.getAllWorksheets().pipe(
      tap(result => {
        if (!result?.length) return;
        this.worksheets.set(result.filter(worksheet => worksheet.type === "General"));
      }),
      catchError(error => {
        console.error('Error in getAllWorksheets: ', error.message);
        throw error;
    })
    ).subscribe();
  }

  resetValues () {
    this.question.set({
      id: 0,
      worksheet_id: 0,
      content: '',
      type: ''
    });
    this.answerOptions.set([]);
  }

  submitValues () {
    console.log(this.question());
    console.log(this.answerOptions());
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'test'
    })
  }

  typeChangeHandler () {
    this.answerOptions.set([{
      id: 0, general_question_id: 0, content: "", is_correct: this.question().type === "General"
    }])
  }

  addAnswerOption () {
    this.answerOptions.update(options => {
      options.push({ id: options.length, general_question_id: 0, content: "", is_correct: false })
      return options;
    })
  }
}
