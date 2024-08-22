import { Component, Input, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { GeneralQuestionOption } from '../../../../models/model';

@Component({
  selector: 'general-question-option',
  standalone: true,
  imports: [CheckboxModule, InputTextModule, FormsModule, ReactiveFormsModule],
  template: `
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
          [(ngModel)]="option.is_correct"
        /> 
      </div>
    </div>
  `,
  styleUrl: './../admin.component.css'
})
export class GeneralQuestionOptionComponent {
  @Input() optionLabel: string = "Option Content";
  @Input() option: GeneralQuestionOption = {
    id: 0, general_question_id: 0, content: '', is_correct: false
  };
}
