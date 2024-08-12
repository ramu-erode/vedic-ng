import { DOCUMENT } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { InputSwitchModule } from 'primeng/inputswitch';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'vedic-shell-root',
  standalone: true,
  imports: [FormsModule, InputSwitchModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Vedic Mathematics';
  #document = inject(DOCUMENT);
  isDarkMode = false;

  constructor() {

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
    window.location.href = `${window.location.origin}/quizzes`
  }
}
