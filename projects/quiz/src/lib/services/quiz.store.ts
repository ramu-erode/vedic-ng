import { computed, DestroyRef, effect, inject, Injectable, Signal, signal, untracked } from "@angular/core";
import isEqual from "lodash/isEqual";
import { EditFields, GeneralQuestion, GeneralQuestionOption, QRDivisionQuestion, StudentWorksheet, Worksheet } from "../../models/model";
import { DataService } from "./data.service";
import { catchError, finalize, interval, takeWhile, tap } from "rxjs";
import map from 'lodash/map';
import findIndex from 'lodash/findIndex';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { getTimeTaken } from "../utilities/datetime";
import { ADD_GENERAL_QUESTION_RESULT, ADD_QR_QUESTION_RESULT, B4_EDIT_STUDENT_WORKSHEET_BY_ID, EDIT_STUDENT_WORKSHEET } from "../constants/api-module-names";
import { getJSONFormatValue, getJSONToUpdate } from "../utilities/format-data";
import { formatDate } from "@angular/common";
import { ActivityTypes } from "../constants/activity-types";
export interface QuestionItem {
    question: GeneralQuestion | QRDivisionQuestion;
    answers: GeneralQuestionOption[];
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

    #isSavingResult = signal<boolean>(false);
    isSavingResult = this.#isSavingResult.asReadonly();

    #worksheetId = signal(0);
    worksheetId = this.#worksheetId.asReadonly();

    #studentWorksheet: StudentWorksheet | null = null;
    #worksheet: Worksheet | null = null;

    setStudentWorksheet (values: any) {
        this.#studentWorksheet = {
            id: values.studentWorksheetId,
            student_id: values.studentId,
            worksheet_id: values.worksheetId,
            assigned_date: formatDate(new Date(values.assignedDate) || new Date(), "YYYY-MM-dd", "en-US"),
            status: ""
        };
    }

    setWorksheetId(id: number) {
        this.#worksheetId.set(id);
    }

    #questions = signal<GeneralQuestion[] | QRDivisionQuestion[]>([]);

    #questionItems = signal<any[]>([]);
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
            const id = this.#worksheetId();
            if (id === 0) return;
            this.loadQuiz(id);
        });

        effect(() => {
            const questions = this.#questions();
            const result = map(questions, question => {
                let currentQuestionAnswers = [];
                let correctAnswers = [];
                if (this.#worksheet?.type === ActivityTypes.GENERAL) {
                    currentQuestionAnswers = getJSONFormatValue((question as GeneralQuestion).general_question_options || []);
                    correctAnswers = currentQuestionAnswers.filter(ans => {
                        if (!ans) return false;
                        return (ans as GeneralQuestionOption).is_correct === 1;
                    });
                } else if (this.#worksheet?.type === ActivityTypes.QRDivision) {
                    currentQuestionAnswers = [(question as QRDivisionQuestion).quotient, (question as QRDivisionQuestion).reminder];
                    correctAnswers = currentQuestionAnswers.map(answer => ({ content: answer }));
                }
                return {
                    question: question,
                    answers: currentQuestionAnswers,
                    startTime: new Date(),
                    endTime: new Date(),
                    isCompleted: false,
                    isCorrect: false,
                    correctAnswer: correctAnswers.length === 1
                        ? correctAnswers[0].content
                        : correctAnswers.map(ans => ans.content)
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
        this.dataService.getWorksheetById(this.#worksheetId()).pipe(
            tap((result) => {
                if (result == null) return;
                this.#worksheet = result as Worksheet;
                if (this.#worksheet.type === ActivityTypes.GENERAL) {
                    this.#questions.set(this.#worksheet.GeneralQuestions || []);
                } else if (this.#worksheet.type === ActivityTypes.QRDivision) {
                    this.#questions.set(getJSONFormatValue(this.#worksheet.QR_Division_Questions || []));
                }
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
            this.#isSavingResult.set(true);
            this.submitFinalResults();
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
        this.#isSavingResult.set(false);
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

    private submitFinalResults () {
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
        this.upateWorksheetWithFinalResult();
        this.saveStudentAnswers();
    }

    private saveStudentAnswers () {
        let answersToSubmit: any = [];
        let moduleName = "";
        if (this.#worksheet?.type === ActivityTypes.GENERAL) {
            moduleName = ADD_GENERAL_QUESTION_RESULT;
            answersToSubmit = this.#questionItems().map(question => {
                return {
                    student_worksheet_id: this.#studentWorksheet?.id,
                    general_question_id: question.question.id,
                    answer_provided: question.givenAnswer,
                    is_correct: question.isCorrect,
                    duration_seconds: question.timeTakenInMs
                        ? Math.floor(question.timeTakenInMs / 1000) : 0
                }
            });
        } else if (this.#worksheet?.type === ActivityTypes.QRDivision) {
            moduleName = ADD_QR_QUESTION_RESULT;
            answersToSubmit = this.#questionItems().map(question => {
                return {
                    student_worksheet_id: this.#studentWorksheet?.id,
                    qr_question_id: question.question.id,
                    quotient_provided: question.givenAnswer[0],
                    reminder_provided: question.givenAnswer[1],
                    is_quotient_correct: question.givenAnswer[0] === question.correctAnswer[0] ? 1 : 0,
                    is_reminder_correct: question.givenAnswer[1] === question.correctAnswer[1] ? 1 : 0,
                    duration_seconds: question.timeTakenInMs
                        ? Math.floor(question.timeTakenInMs / 1000) : 0
                }
            });
        }
        if (!answersToSubmit?.length) return;    
        this.dataService.addModule(moduleName, answersToSubmit).pipe(
            tap((result: any) => {
                if (!result) return null;
                return result;
                }),
                catchError(error => {
                console.error(`Error when adding worksheet: ${error.message}`);
                throw error;
                })
        ).subscribe();
    }

    private upateWorksheetWithFinalResult () {
        this.dataService.getDataForEdit(B4_EDIT_STUDENT_WORKSHEET_BY_ID, this.#studentWorksheet?.id || 0).pipe(
            tap(result => {
                if (!result || !this.#studentWorksheet) return;
                this.#studentWorksheet.status = "Completed";
                let startTime = this.#finalResult()?.startTime;
                let endTime = this.#currentQuestionItem()?.endTime;
                this.#studentWorksheet.start_time = formatDate(startTime || new Date(), "YYYY-MM-dd hh:mm:ss", "en-US") || undefined;
                this.#studentWorksheet.end_time = formatDate(endTime || new Date(), "YYYY-MM-dd hh:mm:ss", "en-US") || undefined;
                this.#studentWorksheet.duration_seconds = endTime && startTime
                    ? Math.floor((endTime.getTime() - startTime.getTime()) / 1000) : 0;
                const updatedJson = getJSONToUpdate(result as EditFields[], this.#studentWorksheet)
                this.editWorksheet(updatedJson);
              }),
              catchError(error => {
                console.error(`Error when fetching question to edit: ${error.message}`);
                throw error;
              })
        ).subscribe();
    }

    private editWorksheet (updatedJson: EditFields[]) {
        this.dataService.editData(EDIT_STUDENT_WORKSHEET, updatedJson).pipe(
            tap((result: any) => {
              return result;
            }),
            catchError(error => {
              console.error(`Error when updating student worksheet: ${error.message}`);
              throw error;
            }),
            finalize(() => this.complete())
          ).subscribe();
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
        if (this.#worksheet?.type === ActivityTypes.GENERAL) {
            const isCorrect = (correctAnswer as Array<string>).every((ans: string) => {
                return studentAnswer.includes(ans);
            });
            return isCorrect;
        } else if (this.#worksheet?.type === ActivityTypes.QRDivision) {
            return isEqual(correctAnswer, studentAnswer);
        }
        return false;        
    }
}