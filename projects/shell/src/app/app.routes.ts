import { Routes } from '@angular/router';
import { QuizListComponent, TableComponent, AdminDashboard, QuizComponent } from '@vedic/quiz';

export const routes: Routes = [
    {
        path: 'admin-dashboard', component: AdminDashboard
    },
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
