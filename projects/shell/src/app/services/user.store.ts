import { DestroyRef, effect, inject, Injectable, signal, untracked } from "@angular/core";
import { catchError, tap } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { AuthenticationService } from "../services/AuthenticationService";
import { DataService } from "./data.service";
import { Student, Profile } from "../models/model";
import { MenuItem } from "primeng/api";
import { Router } from "@angular/router";

@Injectable({ providedIn: 'root' })

export class UserStore {
  #destroyRef = inject(DestroyRef);
  whatsappNumber: string = "";
  #user = signal<Profile | Student | null>(null);
  user = this.#user.asReadonly();

  #isAdmin = signal<boolean>(false);
  isAdmin = this.#isAdmin.asReadonly();

  #students = signal<Student[] | null>(null);
  students = this.#students.asReadonly();

  #currentStudent = signal<Student | null>(null);
  currentStudent = this.#currentStudent.asReadonly();

  #userMenu = signal<MenuItem[] | undefined>(undefined);
  userMenu = this.#userMenu.asReadonly();

  constructor(
    private dataService: DataService,
    private router : Router,
    private authService: AuthenticationService,

  ) {
    if (!this.#user()) this.loginUser();
    effect(() => {
      if (!this.#user()) return;
      this.#isAdmin.set((this.#user() as Profile)?.role_id === 1);
      this.#userMenu.set([{
        label: 'Admin Dashboard',
        path: '/admin-dashboard',
        visible: this.#isAdmin(),
        command: () => {
          this.router.navigate(['/admin-dashboard']);
        }
      }, {
        label: 'Student Dashboard',
        path: '/students',
        visible: !this.#isAdmin(),
        command: () => {
          this.router.navigate(['/students']);
        }
      }, {
        label: 'Logout',
        path: '/login',
        command: () => {
          this.authService.logout();
        }
      }]);
    }, { allowSignalWrites: true })
  }

  setUserProfile (loggedInNumber: string) {
    this.whatsappNumber = loggedInNumber;
    if (!this.whatsappNumber) return;
    this.dataService.getUserProfile(this.whatsappNumber).pipe(
      tap(result => {
        if (!result?.length) return;

        const profile = result[0] as Profile;
        if (!profile) return;
        this.#user.set(profile);
        if (profile.role_id === 1) return;
        
        this.dataService.getStudentsForProfile(String(profile.id)).pipe(
          tap(result => {
            if (!result?.length) return;
            this.#students.set(result);
          }),
          catchError(error => {
            console.error('Error in getStudentsForProfile: ', error.message);
            throw error;
          })
        ).subscribe();
      }),
      catchError(error => {
        console.error('Error in getUserProfile: ', error.message);
        throw error;
      }),
      takeUntilDestroyed(this.#destroyRef)
    ).subscribe();
    console.log("User details loaded");
  }

  loginUser () {
    const whatsappNumber = this.authService.getStoredContactNumber();
    if (!whatsappNumber) return;

    this.authService.login(whatsappNumber).pipe(
      tap(result => { 
        if (!result) {
          return;
        }
        this.setUserProfile(whatsappNumber);
      }),
      catchError(error => {
        console.error(`Error when logging in: ${error.message}`);
        throw error;
      })
    ).subscribe();
  }

  setUser (user: Profile | Student) {
    this.#user.set(user || null);
  }
}