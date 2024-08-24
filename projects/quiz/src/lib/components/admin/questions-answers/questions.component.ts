import { Component, effect, signal } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { catchError, finalize, tap } from "rxjs";
import { GeneralQuestion, Worksheet } from "../../../../models/model";
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from "primeng/button";
import { DropdownModule } from "primeng/dropdown";
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from "primeng/api";
import { DataService } from "../../../services/data.service";
import { AddQuestionsAnswersComponent } from "./add-questions-answers.component";
import { GET_ALL_WORKSHEETS } from "../../../constants/api-module-names";

@Component({
  selector: 'questions',
  standalone: true,
  imports: [
    ButtonModule, DialogModule, TableModule, ProgressSpinnerModule, ToastModule,
    DropdownModule, FormsModule, ReactiveFormsModule, AddQuestionsAnswersComponent
  ],
  providers: [MessageService],
  templateUrl: './questions.component.html',
  styleUrl: './questions.component.css'
})

export class QuestionsComponent {
  worksheets: Worksheet[] = [];
  questions: GeneralQuestion[] = [];
  selectedWorksheetId = signal<number>(-1);
  showLoader: boolean = false;
  showAddQuestion: boolean = false;
  selectedQuestion: GeneralQuestion | null = null;

  constructor(
    private dataService: DataService,
    private messageService: MessageService
  ) {
    this.loadWorksheets();

    effect(() => {
      if (this.selectedWorksheetId() < 0) return;
      this.loadQuestions();
    })
  }

  loadWorksheets () {
    this.showLoader = true;
    this.dataService.getAllInfo(GET_ALL_WORKSHEETS).pipe(
      tap(result => {
        if (!result?.length) return;
        this.worksheets = result.filter(worksheet => worksheet.type === "General");
      }),
      catchError(error => {
        console.error('Error in QuestionsComponent getAllWorksheets: ', error.message);
        throw error;
      }),
      finalize(() => this.showLoader = false)
    ).subscribe();
  }

  loadQuestions () {
    this.showLoader = true;
      this.dataService.getWorksheetById(this.selectedWorksheetId()).pipe(
        tap((result: any) => {
          if (!result) return;
          this.questions = result?.GeneralQuestions || [];
        }),
        catchError(error => {
          this.questions = [];
          console.error('Error in QuestionsComponent getWorksheetById: ', error.message);
          throw error;
        }),
        finalize(() => this.showLoader = false)
      ).subscribe();
  }

  addNewQuestion () {
    if (this.selectedWorksheetId() < 0) return;
    this.showAddQuestion = true;
    this.selectedQuestion = null;
  }

  editQuestion (event: MouseEvent, question: GeneralQuestion) {
    event.preventDefault();
    this.showAddQuestion = true;
    this.selectedQuestion = question;
  }

  closeAddQuestion () {
    this.showAddQuestion = false;
    this.loadQuestions();
  }

  showToastMessage (values: string[]) {
    const [severity, summary, detail] = values;
    this.messageService.add({
      sticky: true,
      severity,
      summary,
      detail
    });
  }
}