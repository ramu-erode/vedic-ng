import { Component, EventEmitter, Input, Output } from '@angular/core';
import cloneDeep from 'lodash/cloneDeep';
import { catchError, finalize, tap } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxChangeEvent, CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DataService } from '../../../services/data.service';
import { EditFields, Topic, Worksheet } from '../../../../models/model';
import { getJSONToUpdate } from '../../../utilities/format-data';
import { ADD_WORKSHEET, B4_EDIT_WORKSHEET_BY_ID, EDIT_WORKSHEET } from '../../../constants/api-module-names';

@Component({
  selector: 'create-worksheet',
  standalone: true,
  imports: [
    ButtonModule, CheckboxModule, DropdownModule, InputTextModule,
    FormsModule, ReactiveFormsModule
  ],
  templateUrl: './create-worksheet.component.html',
  styleUrl: './worksheets.component.css'
})
export class CreateWorksheetComponent {
  @Output() closeDialog = new EventEmitter();
  @Output() showToast = new EventEmitter();
  @Input() topics: Topic[] = [];
  @Input() selectedWorksheet: Worksheet | null = null;
  types = [
    'General',
    'Table',
    'QRDivision'
  ]
  worksheet: Worksheet = {
    id: 0,
    topic_id: -1,
    name: '',
    type: '',
    table_of: '',
    is_practice: 0
  };

  ngOnChanges () {
    this.resetValues();
  }

  constructor (
    private dataService: DataService
  ) {
  }

  resetValues () {
    this.worksheet = this.selectedWorksheet
      ? cloneDeep(this.selectedWorksheet)
      : {
        id: 0,
        topic_id: -1,
        name: '',
        type: '',
        table_of: '',
        is_practice: 0
      };
  }

  typeChangeHandler () {
    if (this.worksheet.type === "Table") return;
    this.worksheet.table_of = null;
  }

  isPracticeChangeHandler (event: CheckboxChangeEvent) {
    this.worksheet.is_practice = event.checked ? 1 : 0;
  }

  addWorksheet () {
    const { id, ...rest } = this.worksheet;
    this.dataService.addModule(ADD_WORKSHEET, [{ ...rest }]).pipe(
      tap((result: any) => {
        if (!result) return;
        this.showToast.emit(['success', 'success', result]);
      }),
      catchError(error => {
        this.showToast.emit(
          ['error', 'Error', `Error when adding worksheet: ${error.message}`]
        );
        throw error;
      }),
      finalize(() => this.closeDialog.emit())
    ).subscribe();
  }

  editWorksheet (updatedJson: EditFields[]) {
    this.dataService.editData(EDIT_WORKSHEET, updatedJson).pipe(
      tap((result: any) => {
        if (!result) return;
        this.showToast.emit(['success', 'success', result]);
      }),
      catchError(error => {
        this.showToast.emit(
          ['error', 'Error', `Error when updating worksheet: ${error.message}`]
        );
        throw error;
      }),
      finalize(() => this.closeDialog.emit())
    ).subscribe();
  }

  updateWorksheet () {
    this.dataService.getDataForEdit(B4_EDIT_WORKSHEET_BY_ID, this.worksheet.id).pipe(
      tap(result => {
        if (!result) return;
        const updatedJson = getJSONToUpdate(result as EditFields[], this.worksheet)
        this.editWorksheet(updatedJson);
      }),
      catchError(error => {
        this.showToast.emit(
          ['error', 'Error', `Error when fetching worksheet to edit: ${error.message}`]
        );
        throw error;
      })
    ).subscribe()
  }
}
