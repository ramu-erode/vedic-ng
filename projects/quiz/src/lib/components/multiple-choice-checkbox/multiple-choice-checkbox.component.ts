import { Component, EventEmitter, Input, Output, effect, signal } from '@angular/core';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { QuestionItem } from '../../services/quiz.store';

@Component({
  selector: 'quiz-multiple-choice-check',
  standalone: true,
  imports: [CheckboxModule, FormsModule, ReactiveFormsModule],
  templateUrl: './multiple-choice-checkbox.component.html',
  styleUrl: './multiple-choice-checkbox.component.css'
})
export class MultipleChoiceCheckboxComponent {
  @Input() currentQuestion: QuestionItem | null = null;
  @Output() setAnswer = new EventEmitter();
  currentAnswer = signal<string []>([]);

  constructor () {
    effect(() => {
        let answer = this.currentAnswer();
        if (!answer?.length) return;
        this.setAnswer.emit(answer);
    }, { allowSignalWrites: true })
  }
}
