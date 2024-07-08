import { Routes } from '@angular/router';
import { QuizListComponent } from '@vedic/quiz';
import { QuizComponent } from '@vedic/quiz';

export const routes: Routes = [
    {
        path: 'quizzes', component: QuizListComponent
    },
    {
        path: 'quiz/:id', component: QuizComponent
    }
];
