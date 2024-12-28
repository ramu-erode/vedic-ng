import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from "@angular/router";
import isEqual from 'lodash/isEqual';
import has from 'lodash/has';
import { tap } from 'rxjs';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DodgingTableRow } from '../../../models/model';
import { QuizStore } from '../../services/quiz.store';

@Component({
  selector: 'dodging-table',
  standalone: true,
  imports: [
    ButtonModule, CommonModule, InputNumberModule,
    FormsModule, ReactiveFormsModule, TableModule
  ],
  providers: [QuizStore],
  templateUrl: './dodging-table.component.html',
  styleUrl: './dodging-table.component.css'
})
export class TableComponent {
  quizStore = inject(QuizStore);
  route = inject(ActivatedRoute);
  tableOfNumber = signal(0);
  tableValues = signal<DodgingTableRow[]>([]);
  columns: number[] = [];
  columnProperties: Array<{ columnId: string, value: number }> = [];
  startMultiplier = signal<number>(1);
  endMultiplier = signal<number>(2);
  expectedResult: DodgingTableRow[] = [];
  showSubmit = signal<boolean>(true);
  has = has;

  constructor () {
    this.route.params.pipe(
        tap(params => this.tableOfNumber.set(params["tableOfNumber"])),
        takeUntilDestroyed()
    ).subscribe();

    effect(() => {
      if (this.tableOfNumber() === 0) return;
  
      let numberToString = this.tableOfNumber().toString();
      this.columns = numberToString.split('').map(Number);

      this.columnProperties = this.columns.map((value: number, index: number) => {
          return { columnId: `column${index + 1}`, value: 0 };
        });
    });

    effect(() => {
      if (this.startMultiplier() >= this.endMultiplier()) return;
      if (!Object.keys(this.columnProperties).length) return;

      this.quizStore.startTimer();
      this.resetValues();
      this.setExpectedResult();
    }, { allowSignalWrites: true });
  }

  setIncorrectValues() {
    this.tableValues.update((values: DodgingTableRow[]) => {
      return values.map((value: DodgingTableRow) => {
        const expectedAnswer = this.expectedResult.find(result => result.label === value.label);
        const isCorrect = value.answer === expectedAnswer?.answer;

        const intermediates = value.intermediates.map(intermediate => {
          const currentIntermediate = expectedAnswer?.intermediates?.find(
            val => val.rowId === intermediate.rowId && val.columnId === intermediate.columnId
          );
          const isCorrectIntermediate = intermediate.value === currentIntermediate?.value
          return {
            ...intermediate,
            isCorrect: isCorrectIntermediate
          }
        })

        return {
          ...value,
          intermediates,
          isCorrect
        }
      })
    })
  }

  submitValues() {
    this.showSubmit.set(false);
    this.quizStore.complete();

    const result = isEqual(this.expectedResult, this.tableValues());
    if (!result) return this.setIncorrectValues();

    this.tableValues.update((values: DodgingTableRow[]) => {
      return values.map((value: DodgingTableRow) => {
        return {
          ...value,
          intermediates: value.intermediates.map(intermediate => ({ ...intermediate, isCorrect: true })),
          isCorrect: true
        }
      })
    })
  }

  resetValues() {
    let tempTableValues: DodgingTableRow[] = [];
    for (let i = this.startMultiplier(); i <= this.endMultiplier(); i++) {
      tempTableValues.push({
        label: `${this.tableOfNumber()} * ${i}`,
        intermediates: this.columnProperties.map(prop => ({ rowId: `row${i}`, ...prop })),
        answer: 0
      });
    }
    this.tableValues.set(tempTableValues);
    this.showSubmit.set(true);
    this.quizStore.startTimer();
  }

  setExpectedResult() {
    let tempResult: DodgingTableRow[] = [];
    for (let i = this.startMultiplier(); i <= this.endMultiplier(); i++) {
      let columnResult = this.columns
        .map((value: number, index: number) => {
          return { columnId: `column${index + 1}`, value: value * i };
        });
      tempResult.push({
        label: `${this.tableOfNumber()} * ${i}`,
        intermediates: columnResult.map(prop => ({ rowId: `row${i}`, ...prop })),
        answer: this.tableOfNumber() * i
      });
    }
    this.expectedResult = tempResult;
  }
}
