import { Component, effect, inject, signal } from "@angular/core";
import { QuestionItem, QuizStore } from "../../services/quiz.store";
import { ActivatedRoute } from "@angular/router";
import findIndex from 'lodash/findIndex';
import { tap } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { RadioButtonModule} from 'primeng/radiobutton';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'vedic-quiz',
    standalone: true,
    imports: [ButtonModule, CommonModule, FormsModule, ReactiveFormsModule, RadioButtonModule],
    providers: [QuizStore],
    templateUrl: './quiz.component.html',
    styleUrl: './quiz.component.css'
})
export class QuizComponent {
    quizStore = inject(QuizStore);
    route = inject(ActivatedRoute);
    currentAnswer = signal("");
    currentQuestion: QuestionItem | null = null;
    currentQuestionIndex = -1;
    isLastQuestion = false;

    constructor() {
        this.route.params.pipe(
            tap(params => this.quizStore.setQuizId(params["id"])),
            takeUntilDestroyed()
        ).subscribe();

        effect(() => {
            const answer = this.currentAnswer();
            if(answer === "") return;
            this.quizStore.setAnswer(answer);
        }, {allowSignalWrites: true})

        effect(() => {
            let questionItems = this.quizStore.questionItems();
            this.currentQuestion = this.quizStore.currentQuestionItem();
            this.currentQuestionIndex = findIndex(questionItems, questionItem => {
                return questionItem?.question?.id === this.currentQuestion?.question?.id
            })
            this.isLastQuestion = this.currentQuestionIndex === questionItems.length - 1
        }, {allowSignalWrites: true})
    }

    next() {
        this.quizStore.next();
    }

    previous() {
        this.quizStore.previous();
    }
}
