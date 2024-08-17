import { DestroyRef, effect, inject, Injectable, signal } from "@angular/core";
import { DataService } from "./data.service";
import { tap } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Profile } from "../../models/model";

@Injectable()

export class UserStore {
  dataService = inject(DataService);
  #destroyRef = inject(DestroyRef);
  whatsappNumber = "+919840004466";
  #user = signal<Profile | null>(null);
  user = this.#user.asReadonly();

  #isAdmin = signal<boolean>(false);
  isAdmin = this.#isAdmin.asReadonly();

  constructor() {
    this.dataService.getUserProfile(this.whatsappNumber).pipe(
      tap(result => {
          if (result == null) return;
          this.#user.set(result);
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