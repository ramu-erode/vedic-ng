import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DataService } from '../services/data.service';
import { Quiz } from '../../models/model';
import { tap } from 'rxjs';

@Component({
    selector: 'vedic-quiz-list',
    standalone: true,
    imports: [RouterOutlet],
    templateUrl: './quiz-list.component.html'
})
export class QuizListComponent implements OnInit{
    dataService = inject(DataService);

    quizzes = signal<Quiz[]>([]);

    ngOnInit() {
        this.dataService.getQuizzes().pipe(
            tap(items => {
                if (items === null) return;
                this.quizzes.set(items);
            })
        ).subscribe();
    }
}