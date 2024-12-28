import { Routes } from '@angular/router';
import { QuizListComponent, TableComponent, AdminDashboard, QuizComponent, HomeComponent, StudentsComponent } from '@vedic/quiz';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { AuthGuard } from './guards/auth.guard';
import { AppComponent } from './app.component';

export const routes: Routes = [
    {
        path: 'login', component: LoginComponent
    },
    {
        path: 'signup', component: SignupComponent
    },
    {
        path: '', component: HomeComponent, canActivate: [AuthGuard]
    },
    {
        path: 'home', component: HomeComponent, canActivate: [AuthGuard]
    },
    {
        path: 'admin-dashboard', component: AdminDashboard, canActivate: [AuthGuard]
    },
    {
        path: 'worksheets', component: QuizListComponent, canActivate: [AuthGuard]
    },
    {
        path: 'students', component: StudentsComponent, canActivate: [AuthGuard]
    },
    {
        path: 'worksheet/:id', component: QuizComponent, canActivate: [AuthGuard]
    },
    {
        path: 'table/:tableOfNumber', component: TableComponent, canActivate: [AuthGuard]
    }
];
