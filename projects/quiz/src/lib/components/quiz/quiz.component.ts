import { Component, effect, inject, signal } from "@angular/core";
import { QuizStore } from "../../services/quiz.store";
import { ActivatedRoute } from "@angular/router";
import { tap } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { RadioButtonModule} from 'primeng/radiobutton';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";

@Component({
    selector: 'vedic-quiz',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RadioButtonModule],
    providers: [QuizStore],
    templateUrl: './quiz.component.html'
})
export class QuizComponent {
    quizStore = inject(QuizStore);
    route = inject(ActivatedRoute);
    currentAnswer = signal("");

    constructor() {
        this.route.params.pipe(
            tap(params => this.quizStore.setQuizId(params["id"])),
            takeUntilDestroyed()
        ).subscribe();

        effect(() => {
            const answer = this.currentAnswer();
            if(answer === "") return;
            this.quizStore.setAnswer(answer);
        }, {allowSignalWrites: true})
    }

    next() {
        this.quizStore.next();
    }
}
