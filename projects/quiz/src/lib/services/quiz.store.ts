import { computed, DestroyRef, effect, inject, Injectable, Signal, signal, untracked } from "@angular/core";
import { Answer, Question } from "../../models/model";
import { DataService } from "./data.service";
import { catchError, interval, takeWhile, tap } from "rxjs";
import map from 'lodash/map';
import filter from 'lodash/filter';
import findIndex from 'lodash/findIndex';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { getTimeTaken } from "../utilities/datetime";

export interface QuestionItem {
    question: Question;
    answers: Answer[];
    givenAnswer?: string | Array<string>;
    startTime: Date;
    endTime: Date;
    isCompleted: boolean;
    isCorrect: boolean;
    correctAnswer: string | Array<string>;
    timeTaken?: string;
    timeTakenInMs?: number;
}

export interface QuizResult {
    numberOfQuestions?: number;
    correctAnswers?: number;
    totalScore?: string;
    startTime?: Date;
    endTime?: Date;
    timeTaken?: string;
}

@Injectable()
export class QuizStore {
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

    #finalResult = signal<QuizResult | null>(null);
    finalResult = this.#finalResult.asReadonly();

    timer: Signal<string>;

    constructor(private dataService: DataService) {
        effect(() => {
            const id = this.#quizId();
            if (id === 0) return;
            this.loadQuiz(id);
        });

        effect(() => {
            const questions = this.#questions();
            const answers = this.#answers();
            const result = map(questions, question => {
                const currentQuestionAnswers = filter(answers, answer => answer.questionId === question.id);
                const correctAnswers = currentQuestionAnswers.filter(ans => ans.isCorrect);
                return {
                    question: question,
                    answers: currentQuestionAnswers,
                    startTime: new Date(),
                    endTime: new Date(),
                    isCompleted: false,
                    isCorrect: false,
                    correctAnswer: correctAnswers.length === 1
                        ? correctAnswers[0].content : correctAnswers.map(ans => ans.content)
                }
            });
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
            catchError(error => {
                console.error('Error in getQuiz: ', error.message);
                throw error;
            }),
            takeUntilDestroyed(this.#destroyRef)
        ).subscribe();
    }

    startTimer() {
        this.#completed.set(false);
        let current = new Date();
        this.#startTime.set(current);
        this.#currentTime.set(current);
        interval(1000).pipe(
            tap(() => this.#currentTime.set(new Date())),
            takeUntilDestroyed(this.#destroyRef),
            takeWhile(ev => !this.#completed())
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
        this.#finalResult.set({ startTime: qi.startTime });
        this.startTimer();
    }

    setAnswer(content: string | Array<string>) {
        const isCorrect = this.isCorrectAnswer(content) || false;
        this.#currentQuestionItem.update(
            q => q ? ({ ...q, givenAnswer: content, isCompleted: true, isCorrect }) : null
        );
        this.updateCurrentQuestion();
    }

    next() {
        this.#index.update(idx => idx + 1);
        this.setEndTime();
        this.updateCurrentQuestion();

        if (this.#index() === this.#questionItems().length) {
            this.complete();
            this.updateFinalResult();
            return;
        }

        this.#currentQuestionItem.set(this.#questionItems()[this.#index()]);
        this.setStartTime();
        this.updateCurrentQuestion();
    }

    previous() {
        this.#index.update(idx => idx - 1);
        this.setEndTime();
        this.updateCurrentQuestion();

        if (this.#index() === -1) {
            return;
        }

        this.#currentQuestionItem.set(this.#questionItems()[this.#index()]);
        this.setStartTime();
        this.updateCurrentQuestion();
    }

    complete() {
        this.#completed.set(true);
    }

    setCurrentQuestion(questionId: number) {
        this.setEndTime();
        this.updateCurrentQuestion();

        let questionIndex = this.#questionItems().findIndex(questionItem => {
            return questionItem?.question?.id === questionId
        });
        this.#index.set(questionIndex);
        this.#currentQuestionItem.set(this.#questionItems()[this.#index()]);
        this.setStartTime();
        this.updateCurrentQuestion();
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

    private updateFinalResult() {
        let correctAnswers = this.#questionItems()?.filter(question => question.isCorrect).length;
        let numberOfQuestions = this.#questionItems()?.length;
        let startTime = this.#finalResult()?.startTime?.getTime() || 0;
        let endTime = this.#currentQuestionItem()?.endTime?.getTime() || 0;
        this.#finalResult.update(value => ({
            ...value,
            endTime: this.#currentQuestionItem()?.endTime,
            numberOfQuestions,
            correctAnswers,
            totalScore: `${correctAnswers}/${numberOfQuestions}`,
            timeTaken: getTimeTaken(endTime - startTime)
        }));
    }

    private setEndTime () {
        let question = this.#currentQuestionItem();
        if (!question) return;

        let endTime = new Date();
        let totalTimeTaken = question?.timeTakenInMs || 0;
        let timeTakenInMs = totalTimeTaken + (endTime.getTime() - question.startTime.getTime());
        this.#currentQuestionItem.update(val => (val ? {
            ...val,
            endTime,
            timeTakenInMs,
            timeTaken: getTimeTaken(timeTakenInMs)
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