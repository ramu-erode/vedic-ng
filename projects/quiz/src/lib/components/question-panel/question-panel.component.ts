import { Component, effect, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestionItem } from '../../services/quiz.store';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { SidePanelQuestions } from "./questions.component";

@Component({
  selector: 'quiz-question-panel',
  standalone: true,
  imports: [
    ButtonModule, CommonModule,
    SidebarModule,
    SidePanelQuestions
],
  templateUrl: './question-panel.component.html',
  styleUrl: './question-panel.component.css'
})
export class QuestionPanelComponent {
  @Input() questions: QuestionItem[] = [];
  @Input() currentQuestionId: number | undefined = -1;
  @Output() setCurrentQuestion = new EventEmitter();
  sidebarVisible = signal<boolean>(false);

  setCurrentQuestionInStore(selectedQuestionId: number) {
    this.setCurrentQuestion.emit(selectedQuestionId);
  }
}
