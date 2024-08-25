import { DOCUMENT, Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { InputSwitchModule } from 'primeng/inputswitch';
import { FormsModule } from '@angular/forms';
import { UserStore } from './services/user.store';

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
  showHeaderFooter: boolean = false;

  constructor(private router: Router, private location: Location) {
    this.location.onUrlChange(url => {
      this.showHeaderFooter = !["/login", "/signup"].includes(url);
    });
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
