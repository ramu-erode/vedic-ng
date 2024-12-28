import { Component, effect } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { Student, UserStore } from '@vedic/shell';

@Component({
  selector: 'students',
  standalone: true,
  imports: [TableModule, DatePipe],
  templateUrl: './students.component.html',
  styleUrl: './students.component.css'
})
export class StudentsComponent {
  students: Student[] | [] = [];

  constructor(private userStore: UserStore, private router: Router) {
    effect(() => {
        if (!this.userStore.students()?.length) return;
        this.students = this.userStore.students()?.filter(student => student.is_active === 1) || [];
    })
  }

  openWorksheets(event: MouseEvent, student: Student) {
    event.preventDefault();
    this.userStore.setUser(student);
    this.router.navigate(['/worksheets']);
  }
}
