import { DOCUMENT } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { InputSwitchModule } from 'primeng/inputswitch';
import { FormsModule } from '@angular/forms';
import { UserStore } from '../../../quiz/src/lib/services/user.store';

@Component({
  selector: 'vedic-shell-root',
  standalone: true,
  imports: [FormsModule, InputSwitchModule, MenuModule, ButtonModule, RouterOutlet],
  providers: [UserStore],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Vedic Mathematics';
  #document = inject(DOCUMENT);
  userStore = inject(UserStore);
  isDarkMode = false;
  userMenu: MenuItem[] | undefined;

  constructor(private router: Router) {
    effect(() => {
      if (!this.userStore.user()) return;

      this.userMenu = [
        {
            label: this.userStore.user()?.name,
            items: [
                ...(this.userStore.isAdmin()
                  ? [{
                      label: 'Admin Dashboard',
                      path: '/admin-dashboard',
                      command: () => {
                        this.router.navigate(['/admin-dashboard']);
                      }
                    }]
                  : []
                ),
                { label: 'Student Dashboard', path: '/student-dashboard' }
            ]
        }
    ];
    })
  }

  toggleLightDark() {
    const linkElement = this.#document.getElementById(
      'app-theme',
    ) as HTMLLinkElement;

    this.isDarkMode = !linkElement.href.includes('dark')

    linkElement.href = this.isDarkMode ? 'theme-dark.css' : 'theme-light.css';
    this.#document.body.setAttribute(
      'data-theme',
      this.isDarkMode ? 'dark' : 'light'
    )
  }

  gotoHome() {
    this.router.navigate(['/']);
  }
}
