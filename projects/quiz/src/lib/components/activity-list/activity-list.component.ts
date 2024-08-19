import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TableModule } from 'primeng/table';
import { DataService } from '../../services/data.service';
import { Quiz } from '../../../models/model';
import { ActivityTypes } from '../../constants/activity-types';
import { catchError, tap } from 'rxjs';

@Component({
    selector: 'vedic-activity-list',
    standalone: true,
    imports: [RouterOutlet, TableModule],
    templateUrl: './activity-list.component.html'
})
export class QuizListComponent implements OnInit{
    quizzes = signal<Quiz[]>([]);
    readonly activityTypes = ActivityTypes;

    constructor(private dataService: DataService) {
    }

    ngOnInit() {
        this.dataService.getQuizzes().pipe(
            tap(items => {
                if (items === null) return;
                this.quizzes.set(items);
            }),
            catchError(error => {
                console.error('Error in getQuizzes: ', error.message);
                throw error;
            })
        ).subscribe();
    }
}
