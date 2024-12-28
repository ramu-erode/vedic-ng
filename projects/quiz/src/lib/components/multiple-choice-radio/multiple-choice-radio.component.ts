import { Component, EventEmitter, Input, Output, effect, signal } from '@angular/core';
import { QuestionItem } from '../../services/quiz.store';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RadioButtonModule } from 'primeng/radiobutton';

@Component({
  selector: 'quiz-multiple-choice-radio',
  standalone: true,
  imports: [RadioButtonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './multiple-choice-radio.component.html',
  styleUrl: './multiple-choice-radio.component.css'
})
export class MultipleChoiceRadioComponent {
  @Input() currentQuestion: QuestionItem | null = null;
  @Output() setAnswer = new EventEmitter();
  currentAnswer = signal<string>("");

  constructor () {
    effect(() => {
      let answer = this.currentAnswer();
      if (answer === "") return;
      this.setAnswer.emit(answer);
    }, { allowSignalWrites: true })
  }

  ngOnChanges () {
    if (!this.currentQuestion?.givenAnswer) return

    this.currentAnswer.set(this.currentQuestion.givenAnswer as string);
  }
}
