import { Routes } from '@angular/router';
import { QuizListComponent, TableComponent, AdminDashboard, QuizComponent } from '@vedic/quiz';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: 'login', component: LoginComponent
    },
    {
        path: 'signup', component: SignupComponent
    },
    {
        path: 'admin-dashboard', component: AdminDashboard, canActivate: [AuthGuard]
    },
    {
        path: 'quizzes', component: QuizListComponent, canActivate: [AuthGuard]
    },
    {
        path: 'quiz/:id', component: QuizComponent, canActivate: [AuthGuard]
    },
    {
        path: 'table/:tableOfNumber', component: TableComponent, canActivate: [AuthGuard]
    }
];
