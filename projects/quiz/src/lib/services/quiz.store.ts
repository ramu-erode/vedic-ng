import { computed, DestroyRef, effect, inject, Injectable, Signal, signal, untracked } from "@angular/core";
import { Answer, Question } from "../../models/model";
import { DataService } from "./data.service";
import { interval, takeWhile, tap } from "rxjs";
import map from 'lodash/map';
import filter from 'lodash/filter';
import findIndex from 'lodash/findIndex';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

export interface QuestionItem {
    question: Question;
    answers: Answer[];
    givenAnswer?: string | Array<string>;
    startTime: Date;
    endTime: Date;
    isCompleted: boolean;
    isCorrect: boolean;
    correctAnswer: string | Array<string>;
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
    #completed = signal(false);
    completed = this.#completed.asReadonly();

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
            const result = map(questions, question => ({
                question: question, answers: filter(answers, answer => answer.questionId === question.id),
                startTime: new Date(), endTime: new Date(), isCompleted: false, isCorrect: false, correctAnswer: []
            }));
            untracked(() => {
                this.#questionItems.set(result);
                this.start();
            });

        }, { allowSignalWrites: true })

        this.timer = computed(() => {
            const d1 = this.#startTime();
            const d2 = this.#currentTime();
            let seconds = ((d2.getTime() - d1.getTime()) / 1000);
            return `${seconds / 60 | 0}:${seconds % 60 | 0}`;
        });
    }

    private loadQuiz(id: number) {
        console.log("Load quiz is called");
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
        console.log("Start is called");
        this.#index.set(0);
        if (this.#questionItems().length <= 0) return;
        const qi = this.#questionItems()[0];
        qi.startTime = new Date();
        this.#currentQuestionItem.set(qi);
        this.#startTime.set(qi.startTime);
        interval(1000).pipe(
            tap(() => this.#currentTime.set(new Date())),
            takeUntilDestroyed(this.#destroyRef),
            takeWhile(ev => !this.#completed())
        ).subscribe();
    }

    setAnswer(content: string) {
        const isCorrect = this.isCorrectAnswer(content) || false;
        this.#currentQuestionItem.update(
            q => q ? ({ ...q, givenAnswer: content, isCompleted: true, isCorrect }) : null
        );
        this.updateCurrentQuestion();
    }

    next() {
        this.#index.update(idx => idx + 1);

        this.#currentQuestionItem.update(val => val ? ({ ...val, endTime: new Date() }) : null);
        this.updateCurrentQuestion();

        if (this.#index() === this.#questionItems().length) {
            this.complete();
            return;
        }

        this.#currentQuestionItem.set(this.#questionItems()[this.#index()]);
        this.setStartTime();
        this.updateCurrentQuestion();
    }

    previous() {
        this.#index.update(idx => idx - 1);

        this.#currentQuestionItem.update(val => val ? ({ ...val, endTime: new Date() }) : null);
        this.updateCurrentQuestion();

        if (this.#index() === -1) {
            return;
        }

        this.#currentQuestionItem.set(this.#questionItems()[this.#index()]);
        this.#currentQuestionItem.update(val => val ? ({ ...val, startTime: new Date() }) : null);
        this.updateCurrentQuestion();
    }

    complete() {
        this.#completed.set(true);
        this.router.navigate([`${this.router.url}/summary`])
    }

    private updateCurrentQuestion() {
        var cqi = this.#currentQuestionItem();
        this.#questionItems.update(qis => {
            const index = findIndex(qis, qi => qi.question.id === cqi?.question.id);
            if (cqi === null) return qis;
            qis[index] = cqi;
            return [...qis];
        });
    }

    private setEndTime () {
        let question = this.#currentQuestionItem();
        if (!question) return;

        let endTime = new Date();
        let timeTakenInSeconds = Math.ceil((endTime.getTime() - question.startTime.getTime()) / 1000);
        let minutesTaken = Math.floor(timeTakenInSeconds / 60);
        let secondsTaken = timeTakenInSeconds % 60;
        this.#currentQuestionItem.update(val => (val ? {
            ...val,
            endTime,
            timeTaken: `${minutesTaken ? minutesTaken + ' min' : ''}${secondsTaken} sec`
        } : null));
    }

    private setStartTime () {
        this.#currentQuestionItem.update(val => val ? ({ ...val, startTime: new Date() }) : null);
    }

    private isCorrectAnswer (studentAnswer: string | Array<string>) {
        let question = this.#currentQuestionItem();
        const { correctAnswer } = question || {};
        if (typeof studentAnswer === 'string') return correctAnswer === studentAnswer;
        if (!correctAnswer?.length) return;
        const isCorrect = (correctAnswer as Array<string>).every((ans: string) => {
            return studentAnswer.includes(ans);
        });
        return isCorrect;
    }
}