import { Component, effect, inject, signal } from "@angular/core";
import { QuestionItem, QuizStore } from "../../services/quiz.store";
import { ActivatedRoute } from "@angular/router";
import findIndex from 'lodash/findIndex';
import { tap } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { CommonModule } from "@angular/common";
import { ButtonModule } from 'primeng/button';
import { QuestionTypes } from "../../constants/question-types";
import { MultipleChoiceCheckboxComponent } from "../multiple-choice-checkbox/multiple-choice-checkbox.component";
import { MultipleChoiceRadioComponent } from "../multiple-choice-radio/multiple-choice-radio.component";
import { TextBlankComponent } from "../text-blank/text-blank.component";
import { QuizSummaryComponent } from "../quiz-summary/quiz-summary.component";
import { QuotientReminderComponent } from "../quotient-reminder/quotient-reminder.component";

@Component({
    selector: 'vedic-quiz',
    standalone: true,
    imports: [
    ButtonModule, CommonModule, MultipleChoiceRadioComponent,
    MultipleChoiceCheckboxComponent, QuizSummaryComponent, TextBlankComponent,
    QuotientReminderComponent
],
    providers: [QuizStore],
    templateUrl: './quiz.component.html',
    styleUrl: './quiz.component.css',
})
export class QuizComponent {
    quizStore = inject(QuizStore);
    route = inject(ActivatedRoute);
    questionItems: QuestionItem[] = [];
    currentQuestion = signal<QuestionItem | null>(null);
    currentQuestionIndex = -1;
    isLastQuestion = false;
    currentQuestionType: string = '';
    readonly questionType = QuestionTypes;
    showSummary = signal(false);

    constructor() {
        this.route.params.pipe(
            tap(params => this.quizStore.setQuizId(params["id"])),
            takeUntilDestroyed()
        ).subscribe();

        effect(() => {
            this.questionItems = this.quizStore.questionItems() || [];
            this.currentQuestion.set(this.quizStore.currentQuestionItem());
            this.currentQuestionType = this.currentQuestion()?.question?.type || '';
            this.currentQuestionIndex = findIndex(this.questionItems, questionItem => {
                return questionItem?.question?.id === this.currentQuestion()?.question?.id
            })
            this.isLastQuestion = this.currentQuestionIndex === this.questionItems.length - 1
        }, { allowSignalWrites: true })

        effect(() => {
            if (this.quizStore.completed()) {
                this.showSummary.set(true);
            }
        }, { allowSignalWrites: true })
    }

    next() {
        this.quizStore.next();
    }

    previous() {
        this.quizStore.previous();
    }
}
