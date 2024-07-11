import { Component, Input, effect } from '@angular/core';
import { TableModule } from 'primeng/table';
import { QuestionItem } from "../../services/quiz.store";

@Component({
  selector: 'quiz-summary',
  standalone: true,
  imports: [TableModule],
  styleUrl: './quiz-summary.component.css',
  templateUrl: './quiz-summary.component.html'
})

export class QuizSummaryComponent {
  @Input() questionItems: QuestionItem[] = [];

  constructor () {
  }
}
 