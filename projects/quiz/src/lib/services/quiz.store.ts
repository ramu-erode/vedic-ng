import { computed, DestroyRef, effect, inject, Injectable, Signal, signal } from "@angular/core";
import { Answer, Question } from "../../models/model";
import { DataService } from "./data.service";
import { interval, tap } from "rxjs";
import * as _ from 'lodash';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

export interface QuestionItem {
    question: Question;
    answers: Answer[];
    startTime: Date;
    endTime: Date;
    isCompleted: boolean;
}

@Injectable()
export class QuizStore {
    dataService = inject(DataService);
    #destroyRef = inject(DestroyRef);

    #quizId = signal(0);
    quizId = this.#quizId.asReadonly();

    setQuizId(id: number) {
        this.#quizId.set(id);
    }

    #questions = signal<Question[]>([]);
    #answers = signal<Answer[]>([]);


    #questionItems = signal<QuestionItem[]>([]);
    questionItems = this.#questionItems.asReadonly();

    #currentQuestionItem = signal<QuestionItem | null>(null);
    currentQuestionItem = this.#currentQuestionItem.asReadonly();

    #index = signal<number>(-1);

    #currentTime = signal<Date>(new Date());
    #startTime = signal<Date>(new Date());

    timer: Signal<string>;
    constructor() {
        effect(() => {
            const id = this.#quizId();
            if (id === 0) return;
            this.loadQuiz(id);
        });

        effect(() => {
            const questions = this.#questions();
            const answers = this.#answers();
            const result = _.map(questions, question => ({
                question: question, answers: _.filter(answers, answer => answer.questionId === question.id),
                startTime: new Date(), endTime: new Date(), isCompleted: false
            }));
            this.#questionItems.set(result);
            this.start();
        }, { allowSignalWrites: true })

        this.timer = computed(() => {
            const d1 = this.#startTime();
            const d2 = this.#currentTime();
            let seconds = ((d2.getTime() - d1.getTime()) / 1000);
            console.log(seconds);
            return `${seconds / 60 | 0}:${seconds % 60 | 0}`;
        });
    }

    private loadQuiz(id: number) {
        this.dataService.getQuiz(id).pipe(
            tap(result => {
                if (result == null) return;
                this.#questions.set(result.questions);
                this.#answers.set(result.answers);
            }),
            takeUntilDestroyed(this.#destroyRef)
        ).subscribe();
    }

    start() {
        this.#index.set(0);
        if (this.#questionItems().length <= 0) return;
        const qi = this.#questionItems()[0];
        qi.startTime = new Date();
        this.#currentQuestionItem.set(qi);
        this.#startTime.set(qi.startTime);
        interval(1000).pipe(
            tap(() => this.#currentTime.set(new Date())),
            takeUntilDestroyed(this.#destroyRef)
        ).subscribe();
    }

    next() {
        this.#index.update(idx => idx + 1);
        this.#currentQuestionItem.update(val => val ? ({ ...val, endTime: new Date() }) : null)
        if (this.#index() === this.#questionItems().length) {
            this.complete();
            return;
        }
        this.#currentQuestionItem.set(this.#questionItems()[this.#index()]);
    }

    complete() {


    }
}