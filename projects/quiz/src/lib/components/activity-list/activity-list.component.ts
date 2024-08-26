import { Component, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TableModule } from 'primeng/table';
import { DataService } from '../../services/data.service';
import { Quiz, Worksheet } from '../../../models/model';
import { ActivityTypes } from '../../constants/activity-types';
import { catchError, tap } from 'rxjs';
import { GET_PRACTICE_WORKSHEETS } from '../../constants/api-module-names';
import { UserStore } from '@vedic/shell';

@Component({
    selector: 'vedic-activity-list',
    standalone: true,
    imports: [RouterOutlet, TableModule],
    templateUrl: './activity-list.component.html'
})
export class QuizListComponent {
    worksheets: Worksheet[] = [];
    readonly activityTypes = ActivityTypes;

    constructor(private dataService: DataService, private userStore: UserStore) {
        effect(() => {
            if (!this.userStore.user()) return;
            const studentId = this.userStore.user()?.id || 0;
            if (!studentId) return;
            this.dataService.getDataForId(GET_PRACTICE_WORKSHEETS, studentId).pipe(
                tap(items => {
                    if (items === null) return;
                    this.worksheets = items;
                }),
                catchError(error => {
                    console.error('Error in getQuizzes: ', error.message);
                    throw error;
                })
            ).subscribe();
        })
    }
}
