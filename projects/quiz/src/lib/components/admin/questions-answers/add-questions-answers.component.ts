import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import cloneDeep from 'lodash/cloneDeep';
import { catchError, combineLatest, finalize, tap } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataService } from '../../../services/data.service';
import { EditFields, GeneralQuestion, GeneralQuestionOption } from '../../../../models/model';
import { GeneralQuestionOptionComponent } from './general-question-option.component';
import { QuestionTypes } from '../../../constants/question-types';
import { getJSONFormatOptions, getJSONToUpdate } from '../../../utilities/format-data';
import { ADD_GENERAL_QUESTION, B4_EDIT_GENERAL_QUESTION_BY_ID, B4_EDIT_QUESTION_OPTION_BY_ID, DELETE_QUESTION_OPTION, EDIT_GENERAL_QUESTION, EDIT_QUESTION_OPTION } from '../../../constants/api-module-names';

@Component({
  selector: 'add-questions-answers',
  standalone: true,
  imports: [
    ButtonModule, CheckboxModule, DropdownModule, InputTextModule, CommonModule,
    FormsModule, ReactiveFormsModule, GeneralQuestionOptionComponent
  ],
  templateUrl: './add-questions-answers.component.html',
  styleUrl: './questions.component.css'
})
export class AddQuestionsAnswersComponent {
  @Output() closeDialog = new EventEmitter();
  @Output() showToast = new EventEmitter();
  @Input() worksheetId: number = -1;
  @Input() selectedQuestion: GeneralQuestion | null = null;
  questionTypes = QuestionTypes;
  question: GeneralQuestion = {
    id: -1,
    worksheet_id: this.worksheetId,
    general_question_options: [],
    content: '',
    type: ''
  };
  types = [
    QuestionTypes.GENERAL,
    QuestionTypes.RADIO,
  ];
  generalQuestionOptions: GeneralQuestionOption[] = [];

  constructor (
    private dataService: DataService
  ) {
  }

  ngOnChanges () {
    this.question.worksheet_id = this.worksheetId;
    this.resetValues();
  }

  resetValues () {
    if (this.selectedQuestion) {
      this.question = cloneDeep(this.selectedQuestion);
      if (this.question.general_question_options?.length) {
        this.generalQuestionOptions = getJSONFormatOptions(this.question);
      } else {
        this.generalQuestionOptions = [{
          id: -1,
          general_question_id: this.question.id,
          content: "",
          is_correct: this.question.type === QuestionTypes.GENERAL ? 1 : 0
        }];
      }
      return;
    }
    this.question = {
      id: -1,
      worksheet_id: this.worksheetId,
      content: '',
      type: ''
    };
    this.generalQuestionOptions = [];
  }

  addQuestion () {
    const { id, ...rest } = this.question;
    this.dataService.addModule(ADD_GENERAL_QUESTION, [{ ...rest }]).pipe(
      tap((result: any) => {
        if (!result) return;
        this.showToast.emit(['success', 'success', result]);
      }),
      catchError(error => {
        this.showToast.emit(
          ['error', 'Error', `Error when adding question: ${error.message}`]
        );
        throw error;
      }),
      finalize(() => this.closeDialog.emit())
    ).subscribe();    
  }

  updateQuestion () {
    this.dataService.getDataForEdit(B4_EDIT_GENERAL_QUESTION_BY_ID, this.question.id).pipe(
      tap(result => {
        if (!result) return;
        const updatedJson = getJSONToUpdate(result as EditFields[], this.question)
        this.editQuestion(updatedJson);
      }),
      catchError(error => {
        this.showToast.emit(
          ['error', 'Error', `Error when fetching question to edit: ${error.message}`]
        );
        throw error;
      }),
      finalize(() => this.closeDialog.emit())
    ).subscribe();

    this.addQuestionOptions();
    this.updateQuestionOptions();
  }

  editQuestion (updatedJson: EditFields[]) {
    this.dataService.editData(EDIT_GENERAL_QUESTION, updatedJson).pipe(
      tap((result: any) => {
        if (!result) return;
        this.showToast.emit(['success', 'success', result]);
      }),
      catchError(error => {
        this.showToast.emit(
          ['error', 'Error', `Error when updating question: ${error.message}`]
        );
        throw error;
      }),
    ).subscribe();
  }

  addQuestionOptions () {
    if (!this.generalQuestionOptions?.length) return;
    const optionsToAdd = this.generalQuestionOptions.filter(option => option.id < 0 && !option.canDelete);
    if (!optionsToAdd.length) return;

    this.dataService.addAnswerOptions(optionsToAdd).pipe(
      tap((result: any) => {
        if (!result) return;
        this.showToast.emit(['success', 'success', result]);
      }),
      catchError(error => {
        this.showToast.emit(
          ['error', 'Error', `Error when adding question option: ${error.message}`]
        );
        throw error;
      }),
      finalize(() => this.closeDialog.emit())
    ).subscribe();    
  }

  updateQuestionOptions () {
    if (!this.generalQuestionOptions?.length) return;
    const optionsToUpdate = this.generalQuestionOptions.filter(option => option.id >= 0 && !option.canDelete);
    if (!optionsToUpdate?.length) return;

    this.deleteQuestionOptions();
    const updatedJsons: any = [];
    const optionsToUpdateObservables = optionsToUpdate.map((option, index) => {
      return this.dataService.getDataForEdit(B4_EDIT_QUESTION_OPTION_BY_ID, option.id).pipe(
        tap(result => {
          if (!result) return;
          const updatedJson = getJSONToUpdate(result as EditFields[], option);
          updatedJsons.push(updatedJson);
          if (index === optionsToUpdate.length - 1) {
            this.editQuestionOptions(updatedJsons);
          }
        }),
        catchError(error => {
          this.showToast.emit(
            ['error', 'Error', `Error when fetching question option to edit: ${error.message}`]
          );
          throw error;
        }),
        finalize(() => this.closeDialog.emit())
      )  
    });
    combineLatest(optionsToUpdateObservables).subscribe();
  }

  editQuestionOptions (updatedJsons: Array<Array<EditFields>>) {
    const editResults: any = [];
    const optionsToUpdateObservables = updatedJsons.map(updatedJson => {
      return this.dataService.editData(EDIT_QUESTION_OPTION, updatedJson).pipe(
        tap((result: any) => {
          if (!result) return;
          editResults.push({ success: true, message: result });
        }),
        catchError(error => {
          editResults.push({ success: false, message: error.message });
          throw error;
        }),
      )
    })
    combineLatest(optionsToUpdateObservables).subscribe(() => {
      if (!editResults?.length) return;
      if (editResults.length < optionsToUpdateObservables.length) return;
      const allUpdated = editResults.every((result: any) => result.success);
      const messages = editResults.map((result: any) => `${result.message} \n`).join('');
      this.showToast.emit(
        [
          allUpdated ? 'success' : 'error',
          allUpdated ? 'Success' : 'Error',
          messages
        ]
      );
    });
  }

  deleteQuestionOptions () {
    const optionsToDelete = this.generalQuestionOptions.filter(option => option.canDelete);
    if (!optionsToDelete?.length) return;
    const optionIdsToDelete = optionsToDelete.map(option => ({ id: option.id }));

    this.dataService.deleteModule(DELETE_QUESTION_OPTION, optionIdsToDelete).pipe(
      tap((result: any) => {
        console.log(result);
      }),
      catchError(error => {
        console.error(`Error when adding question option: ${error.message}`);
        throw error;
      })
    ).subscribe();
  }

  typeChangeHandler () {
    if (!this.selectedQuestion) return;
    if (this.question.general_question_options?.length) {
      this.generalQuestionOptions = getJSONFormatOptions(this.question);
      if (this.question.type === QuestionTypes.GENERAL) {
        this.generalQuestionOptions = this.generalQuestionOptions.map((option, index) => {
          if (index === 0) return option;
          return { ...option, canDelete: true, is_correct: 0 };
        });
      }
      return;
    }
    this.generalQuestionOptions = [{
      id: -1,
      general_question_id: this.question.id,
      content: "",
      is_correct: this.question.type === QuestionTypes.GENERAL ? 1 : 0
    }];
  }

  addAnswerOption () {
    this.generalQuestionOptions.push({
      id: 0 - (this.generalQuestionOptions.length + 1),
      general_question_id: this.question.id,
      content: "",
      is_correct: 0
    })
  }

  removeOption (optionId: number) {
    this.generalQuestionOptions = this.generalQuestionOptions.map(option => {
      if (option.id !== optionId) return option;
      return { ...option, canDelete: true, is_correct: 0 };
    });
  }
}
