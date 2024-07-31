import { Routes } from '@angular/router';
import { QuizListComponent, TableComponent } from '@vedic/quiz';
import { QuizComponent } from '@vedic/quiz';

export const routes: Routes = [
    {
        path: 'quizzes', component: QuizListComponent
    },
    {
        path: 'quiz/:id', component: QuizComponent
    },
    {
        path: 'table/:tableOfNumber', component: TableComponent
    }
];
