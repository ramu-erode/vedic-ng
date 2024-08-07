import { Component, effect, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
import { QuestionItem } from '../../services/quiz.store';

@Component({
  selector: 'side-panel-questions',
  standalone: true,
  imports: [CommonModule, RadioButtonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="questions">
      <div *ngFor="let question of questions; index as i;" class="field-checkbox">
        <p-radioButton
          name="question"
          [value]="question?.question?.id"
          [inputId]="question.question.id.toString()"
          [(ngModel)]="selectedQuestionId"
        />
        <label [for]="question.question.id.toString()" class="ml-1">Qn {{i + 1}}</label>
      </div>
    </div>
  `,
  styleUrl: './question-panel.component.css',
  styles: `
    :host {
      padding: 0;
      max-width: unset;
    }
  `
})

export class SidePanelQuestions {
  @Input() questions: QuestionItem[] = [];
  @Input() currentQuestionId: number | undefined = -1;
  @Output() setCurrentQuestion = new EventEmitter();
  selectedQuestionId = signal<number>(-1);

  constructor() {
    effect(() => {
      let selectedQuestionId = this.selectedQuestionId();
      if (!selectedQuestionId || selectedQuestionId === this.currentQuestionId) return;
      this.setCurrentQuestion.emit(selectedQuestionId);
    });
  }

  ngOnChanges() {
    if (!this.currentQuestionId || this.currentQuestionId === -1) return;
    this.selectedQuestionId.set(this.currentQuestionId);
  }
}
