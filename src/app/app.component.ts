import { Component } from '@angular/core';
import { Quizz, Row, RowInfo } from './quiz.class';
import { LocalStorageService } from './service/local-storage.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  constructor(private localStorage: LocalStorageService) {
    const darkMode = this.localStorage.getDarkMode();
    document.body.classList.toggle('dark', darkMode);
  }
}
