import { Component, EventEmitter, Input, Output, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { QuestionItem } from '../../services/quiz.store';

@Component({
  selector: 'quiz-text-blank',
  standalone: true,
  imports: [CommonModule, InputTextModule, FormsModule, ReactiveFormsModule],
  templateUrl: './text-blank.component.html',
  styleUrl: './text-blank.component.css'
})
export class TextBlankComponent {
  @Input() currentQuestion: QuestionItem | null = null;
  @Output() setAnswer = new EventEmitter();
  currentAnswer = signal<string>("");

  constructor () {
    effect(() => {
        let answer = this.currentAnswer();
        if (!answer) return;
        this.setAnswer.emit(answer);
    }, { allowSignalWrites: true })
  }

  ngOnChanges () {
    if (!this.currentQuestion) return

    this.currentAnswer.set(this.currentQuestion.givenAnswer as string);
  }
}
