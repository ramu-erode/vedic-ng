import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CheckboxChangeEvent, CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { GeneralQuestionOption } from '../../../../models/model';

@Component({
  selector: 'general-question-option',
  standalone: true,
  imports: [CheckboxModule, InputTextModule, FormsModule, ReactiveFormsModule],
  template: `
    @if (option) {
      @if (!option.canDelete) {
        <div class="option-container">
          <div class="control-container">
            <label for="content">{{optionLabel}}</label>
            <input pInputText id="content" [(ngModel)]="option.content" />
          </div>
          <div class="control-container">
            <label for="isCorrect">Is correct answer?</label>
            <p-checkbox
              inputId="isCorrect"
              [binary]="true"
              (onChange)="setIsCorrect($event)"
              [ngModel]="option.is_correct === 1"
            />
            @if (showRemoveOption) {
              <p class="remove-option" (click)="removeAnswerOption()">Remove Option</p>
            }
          </div>
        </div>
      }
    }
  `,
  styleUrl: './questions.component.css'
})
export class GeneralQuestionOptionComponent {
  @Input() optionLabel: string = "Option Content";
  @Input() showRemoveOption: boolean = false;
  @Input() option: GeneralQuestionOption = {
    id: -1, general_question_id: 0, content: '', is_correct: 0
  };
  @Output() removeOption = new EventEmitter();

  setIsCorrect (event: CheckboxChangeEvent) {
    this.option.is_correct = event.checked ? 1 : 0;
  }

  removeAnswerOption () {
    this.removeOption.emit(this.option.id);
  }
}
