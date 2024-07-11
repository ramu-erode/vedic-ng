import { Component, EventEmitter, Input, Output, effect, signal } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { QuestionItem } from '../../services/quiz.store';

@Component({
  selector: 'quiz-text-blank',
  standalone: true,
  imports: [InputTextModule, FormsModule, ReactiveFormsModule],
  templateUrl: './text-blank.component.html',
  styleUrl: './text-blank.component.css'
})
export class TextBlankComponent {
  @Input() currentQuestion: QuestionItem | null = null;
  @Output() setAnswer = new EventEmitter();
  currentAnswer = signal("");

  constructor () {
    effect(() => {
        let answer = this.currentAnswer();
        if (answer === "") return;
        this.setAnswer.emit(answer);
    }, { allowSignalWrites: true })
  }
}
