import { DestroyRef, effect, inject, Injectable, signal } from "@angular/core";
import { DataService } from "./data.service";
import { catchError, tap } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Profile, Student } from "../../models/model";

@Injectable({ providedIn: 'root' })

export class UserStore {
  #destroyRef = inject(DestroyRef);
  whatsappNumber = "+919840004466";
  #user = signal<Profile | null>(null);
  user = this.#user.asReadonly();

  #isAdmin = signal<boolean>(false);
  isAdmin = this.#isAdmin.asReadonly();

  #students = signal<Student[] | null>(null);
  students = this.#students.asReadonly();

  #currentStudent = signal<Student | null>(null);
  currentStudent = this.#currentStudent.asReadonly();

  constructor(private dataService: DataService) {
    this.dataService.getUserProfile(this.whatsappNumber).pipe(
      tap(result => {
        if (!result?.length) return;
        this.#user.set(JSON.parse(result[0]) as Profile);
      }),
      catchError(error => {
        console.error('Error in getUserProfile: ', error.message);
        throw error;
      }),
      takeUntilDestroyed(this.#destroyRef)
    ).subscribe();
    console.log("User details loaded");

    effect(() => {
      if (!this.#user()) return;
      this.#isAdmin.set(this.#user()?.role_id === 1);
    }, { allowSignalWrites: true })
  }
}