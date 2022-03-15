import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { HelpModalComponent } from '../components/help-modal/help-modal.component';
import { InfoModalComponent } from '../components/info-modal/info-modal.component';
import { SettingsModalComponent } from '../components/settings-modal/settings-modal.component';
import { Quizz, Row, RowInfo } from '../quiz.class';
import { LocalStorageService } from '../service/local-storage.service';



@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  quizz: Quizz;
  allNumbers = [{num: 1, disabled: false}, {num: 2, disabled: false}, {num: 3, disabled: false}, {num: 4, disabled: false},
    {num: 5, disabled: false}, {num: 6, disabled: false}, {num: 7, disabled: false},
    {num: 8, disabled: false}, {num: 9, disabled: false}, {num: 0, disabled: false}];
  userValue = '';
  difficulty = 7;
  userGuess = [];
  numberOfTheDay = '';
  currentDate: Date;
  won;
  modalOpen = false;

  constructor(private localStorage: LocalStorageService,
    private modalController: ModalController) {
    this.quizz = new Quizz({
      rows: []
    });

    for(let i = 0; i < this.difficulty; i++) {
      const result = new Row({
        info: new RowInfo()
      });
      this.quizz.rows.push(result);
    }

    this.localStorage.newQuizz$.subscribe( quizz => {
      this.numberOfTheDay = quizz.code;
      this.currentDate = quizz.date;
      this.loadTodaysBoard();
    });
  }

  loadTodaysBoard() {
    const rows = this.localStorage.getBoard();
    if(!rows) {
      return;
    }

    rows.forEach( row => {
      this.userValue = row;
      this.addRowToQuizz();
    });
    this.didWon();
    this.userValue = '';
  }

  clickChar(char) {
    if(this.userValue.length < 7 && !this.won) {
      this.userValue += char.num;
      this.quizz.setUserValue(this.userValue, {}, this.userGuess.length);
    }
  }

  enter() {
    if(this.userValue.length === 7) {
      this.addRowToQuizz();

      this.localStorage.addBoard(this.userValue);

      if(this.won || this.userGuess.length >= this.difficulty) {
        this.endToday();
      }

      this.userValue = '';
    }
  }

  endToday() {
    this.localStorage.addStatistics(this.userGuess.length);
    this.info();
  }

  addRowToQuizz() {
    const rowInfo = this.setRowInfo();

    if(rowInfo.numPositionCorrect > 6) {
      this.quizz.finish(this.userGuess.length);
      this.won = true;
    }

    this.quizz.setUserValue(this.userValue, rowInfo, this.userGuess.length);
    this.userGuess.push(this.userValue);
  }

  setRowInfo() {
    let numPositionCorrect = 0;
    let numCorrect = 0;

    [...this.userValue].forEach((userNum, userIndex) => {
      [...this.numberOfTheDay].forEach((numberOfDay, dayIndex) => {
        if (userNum === numberOfDay) {
          numCorrect++;
          if (userIndex === dayIndex) {
            numPositionCorrect++;
          }
        }
      });
    });

    return { numPositionCorrect, numCorrect };
  }

  explain() {
    this.openModal(HelpModalComponent);
  }

  info() {
    this.openModal(InfoModalComponent);
  }

  settings() {
    this.openModal(SettingsModalComponent);
  }

  async openModal(com) {
    if(this.modalOpen) {
      return;
    }

    this.modalOpen = true;
    const modal = await this.modalController.create({
      component: com
    });
    await modal.present();
    this.modalOpen = false;
  }

  deleteNum() {
    this.userValue = this.userValue.slice(0, this.userValue.length - 1);

    this.quizz.setUserValue(this.userValue, {}, this.userGuess.length);
  }

  didWon() {
    this.won = this.userValue === this.numberOfTheDay;
  }
}
