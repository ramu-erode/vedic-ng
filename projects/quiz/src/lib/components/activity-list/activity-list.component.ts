import { Component, effect } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { TableModule } from 'primeng/table';
import { DataService } from '../../services/data.service';
import { Worksheet } from '../../../models/model';
import { ActivityTypes } from '../../constants/activity-types';
import { catchError, tap } from 'rxjs';
import { GET_ASSIGNED_WORKSHEETS_FOR_STUDENT, GET_PRACTICE_WORKSHEETS } from '../../constants/api-module-names';
import { UserStore } from '@vedic/shell';

@Component({
    selector: 'vedic-activity-list',
    standalone: true,
    imports: [RouterOutlet, TableModule, RouterLink],
    templateUrl: './activity-list.component.html'
})
export class QuizListComponent {
    assignedWorksheets: Worksheet[] = [];
    practiceWorksheets: Worksheet[] = [];
    readonly activityTypes = ActivityTypes;

    constructor(private dataService: DataService, private userStore: UserStore) {
        effect(() => {
            if (!this.userStore.user()) return;
            const studentId = this.userStore.user()?.id || 0;
            if (!studentId) return;
            this.dataService.getDataForId(GET_PRACTICE_WORKSHEETS, studentId).pipe(
                tap(items => {
                    if (items === null) return;
                    this.practiceWorksheets = items;
                }),
                catchError(error => {
                    console.error('Error in getPracticeWorksheets: ', error.message);
                    throw error;
                })
            ).subscribe();
            this.dataService.getDataForId(GET_ASSIGNED_WORKSHEETS_FOR_STUDENT, studentId).pipe(
                tap(items => {
                    if (items === null) return;
                    this.assignedWorksheets = items;
                }),
                catchError(error => {
                    console.error('Error in getAssignedWorksheets: ', error.message);
                    throw error;
                })
            ).subscribe();
        })
    }
}
