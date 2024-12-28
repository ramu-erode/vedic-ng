import { Component, effect, ElementRef, signal, ViewChild, ViewContainerRef } from "@angular/core";
import { DataService } from "../../../services/data.service";
import { MessageService } from "primeng/api";
import { catchError, debounceTime, distinctUntilChanged, finalize, fromEvent, map, tap } from "rxjs";
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Topic, Worksheet } from "../../../../models/model";
import { ButtonModule } from "primeng/button";
import { CreateWorksheetComponent } from "./create-worksheet.component";
import { GET_ALL_TOPICS, GET_ALL_WORKSHEETS } from "../../../constants/api-module-names";
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'worksheets',
  standalone: true,
  imports: [
    ButtonModule, DialogModule, FormsModule, FloatLabelModule, InputTextModule, TableModule, ProgressSpinnerModule,
    CreateWorksheetComponent, ToastModule
  ],
  providers: [MessageService],
  templateUrl: './worksheets.component.html',
  styleUrl: './worksheets.component.css'
})

export class WorksheetsComponent {
  worksheets:Worksheet[] = [];
  topics: Topic[] = [];
  showLoader: boolean = false;
  showAddWorksheet: boolean = false;
  selectedWorksheet: Worksheet | null = null;
  search_value = '';  
  constructor(
    private dataService: DataService,
    private messageService: MessageService
  ) {
    this.showLoader = true;
    this.dataService.getAllInfo(GET_ALL_TOPICS).pipe(
      tap(result => {
        if (!result?.length) return;
        this.topics = result;
        this.loadWorksheets();        
      }),
      catchError(error => {
        console.error('Error in WorksheetsComponent getAllTopics: ', error.message);
        throw error;
      }),
      finalize(() => this.showLoader = false)
    ).subscribe();

   
  }
 
  loadWorksheets () {
    this.showLoader = true;
    this.dataService.getAllInfo(GET_ALL_WORKSHEETS).pipe(
      tap(result => {
        if (!result?.length) return;
        this.worksheets = result.map(worksheet => {
          const currentTopic = this.topics?.find(topic => topic.id === worksheet.topic_id);
          return {
            ...worksheet,
            topicName: currentTopic?.name || ''
          }
        });
      }),
      catchError(error => {
        console.error('Error in WorksheetsComponent getAllWorksheets: ', error.message);
        throw error;
      }),
      finalize(() => this.showLoader = false)
    ).subscribe();
  }

  addNewWorksheet () {
    this.showAddWorksheet = true;
    this.selectedWorksheet = null;
  }

  editWorksheet (event: MouseEvent, worksheet: Worksheet) {
    event.preventDefault();
    this.showAddWorksheet = true;
    this.selectedWorksheet = worksheet;
  }

  closeAddWorksheet () {
    this.showAddWorksheet = false;
    this.loadWorksheets();
  }

  showToastMessage (values: string[]) {
    const [severity, summary, detail] = values;
    this.messageService.add({
      severity,
      summary,
      detail
    });
  }
 
  searchSubmit(event: any){   
    fromEvent(event.target, 'keyup')
      .pipe( 
        map((event: any) => {
          return event;
        }),
        debounceTime(1000),
        distinctUntilChanged(),
      ).subscribe((event: any) => {        
        const term = event.target.value;
        this.worksheets = this.worksheets.filter((o: any) => Object.keys(o).some(k => ( k === 'name' || k === 'topicName') && (o[k].toLowerCase().includes(term.toLowerCase()))));
    });
  }
  
}