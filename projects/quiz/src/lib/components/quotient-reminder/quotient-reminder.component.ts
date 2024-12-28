import { Component, effect, EventEmitter, Input, Output, signal } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { QuestionItem } from '../../services/quiz.store';

@Component({
  selector: 'quiz-quotient-reminder',
  standalone: true,
  imports: [InputTextModule, FormsModule, ReactiveFormsModule],
  templateUrl: './quotient-reminder.component.html',
  styleUrl: './quotient-reminder.component.css'
})
export class QuotientReminderComponent {
  @Input() currentQuestion: QuestionItem | null = null;
  @Output() setAnswer = new EventEmitter();
  quotient = signal<string>("");
  reminder = signal<string>("");

  constructor () {
    effect(() => {
        this.setAnswer.emit([this.quotient(), this.reminder()]);
    }, { allowSignalWrites: true })
  }

  ngOnChanges () {
    this.quotient.set((this.currentQuestion?.givenAnswer as Array<string>)?.[0] || "");
    this.reminder.set((this.currentQuestion?.givenAnswer as Array<string>)?.[1] || "");
  }
}
