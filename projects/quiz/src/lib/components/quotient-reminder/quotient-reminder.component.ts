import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { QuestionItem } from '../../services/quiz.store';

@Component({
  selector: 'quiz-quotient-reminder',
  standalone: true,
  imports: [],
  templateUrl: './quotient-reminder.component.html',
  styleUrl: './quotient-reminder.component.css'
})
export class QuotientReminderComponent {
  @Input() currentQuestion: QuestionItem | null = null;
  @Output() setAnswer = new EventEmitter();
  currentAnswer = signal<string>("");
}
