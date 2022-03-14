import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { HelpModalComponent } from '../components/help-modal/help-modal.component';
import { InfoModalComponent } from '../components/info-modal/info-modal.component';
import { SettingsModalComponent } from '../components/settings-modal/settings-modal.component';
import { Quizz, Row, RowInfo, Cell } from '../quiz.class';
import { LocalStorageService } from '../service/local-storage.service';

const millisecondsOnADay = 86400000;

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
  disabledChars = [];
  modalOpen = false;

  constructor(private localStorage: LocalStorageService,
    private modalController: ModalController) {
    this.currentDate = this.localStorage.getDate();

    if(this.currentDate && new Date() > new Date( this.currentDate.getTime() + millisecondsOnADay)) {
      this.won = false;
      this.localStorage.getTodaysQuery();
    }

    this.quizz = new Quizz({
      rows: []
    });

    this.numberOfTheDay = this.localStorage.getSolution();

    for(let i = 0; i < this.difficulty; i++) {
      const result = new Row({
        info: new RowInfo()
      });
      this.quizz.rows.push(result);
    }

    this.loadTodaysBoard();
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

  deleteLastBoard() {
    this.localStorage.resetBoard();
  }

  pushToArrayIfNotFound(array, values) {
    values.forEach( char => {
      const found = array.find(c => c === char.num);
      if(!found) {
        array.push(char.num);
      }
    });
  }

  getEasiestRow() {
    return this.quizz.rows.reduce( (accRow, currRow) => currRow.info.numCorrect < accRow.info.numCorrect ? currRow : accRow);
  }

  getSamePositionRow() {
    return this.quizz.rows.reduce( (accRow, currRow) => Math.abs(currRow.info.numCorrect - currRow.info.numPositionCorrect) <
      Math.abs(accRow.info.numCorrect - accRow.info.numPositionCorrect) ? currRow : accRow);
  }

  clickChar(char) {
    if(this.userValue.length < 7 && !this.won) {
      this.userValue += char.num;
      char.disabled = true;
      this.disabledChars.push(char);
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
    this.info();
    this.localStorage.addStatistics(this.userGuess.length);
  }

  addRowToQuizz() {
    const rowInfo = this.setRowInfo();

    if(rowInfo.numPositionCorrect > 6) {
      this.quizz.finish(this.userGuess.length);
      this.won = true;
    }

    this.quizz.setUserValue(this.userValue, rowInfo, this.userGuess.length);
    this.enableAllButtons();
    this.userGuess.push(this.userValue);
  }

  enableAllButtons() {
    this.allNumbers.forEach( char => {
      char.disabled = false;
    });
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

  clean() {
    this.quizz.clearCheck();
    this.enableAllButtons();
  }

  deleteNum() {
    this.userValue = this.userValue.slice(0, this.userValue.length - 1);
    const last = this.disabledChars.length - 1;
    if (last >= 0) {
      this.disabledChars[last].disabled = false;
      this.disabledChars.pop();
    }
    this.quizz.setUserValue(this.userValue, {}, this.userGuess.length);
  }

  didWon() {
    this.won = this.userValue === this.numberOfTheDay;
  }

  onPosition(char, index) {
    return char === this.numberOfTheDay.charAt(index);
  }

  onSolution(char) {
    return this.numberOfTheDay.includes(char);

  }
}
