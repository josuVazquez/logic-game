import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { HelpModalComponent } from '../components/help-modal/help-modal.component';
import { InfoModalComponent } from '../components/info-modal/info-modal.component';
import { SettingsModalComponent } from '../components/settings-modal/settings-modal.component';
import { Quizz, Row, RowInfo } from '../quiz.class';
import { LocalStorageService } from '../service/local-storage.service';

const millisecondsOnOneSecond = 1000;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  quizz: Quizz;
  difficulty = 7;
  numbersOfTheDay = [];
  userNumbers = [];
  currentDate: Date;
  finish = false;
  modalOpen = false;
  selectedChar: any;
  selectedCharAux: any;
  auxChar: any;
  counter: Date = new Date();
  timerRef: any;
  running = false;
  completedRow = [];
  disorderArray = [];

  constructor(private localStorage: LocalStorageService,
  private modalController: ModalController) {
    this.counter.setMinutes(0);
    this.counter.setSeconds(0);
    this.counter.setMilliseconds(0);
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
      if(!quizz.date) {
        return;
      }
      this.numbersOfTheDay = quizz.codes;
      this.currentDate = quizz.date;
      this.disorderArray = quizz.disorderCodes;
      if(this.localStorage.getRemainingTime() > 0) {
        this.start();
      }
    });
  }

  start() {
    if(this.running) {
      return;
    }

    this.running = true;
    this.loadTodaysBoard();
    this.localStorage.addBoard(this.userNumbers);
    this.startTimer();
  }

  loadTodaysBoard() {
    let rows = this.localStorage.getBoard();
    if(!rows || !rows.length) {
      this.userNumbers = [...this.disorderArray];
      rows = [...this.userNumbers];
    } else {
      this.userNumbers = [...rows];
    }

    rows.forEach( (row, index) => {
      this.addRowToQuizz(row, index);
      if(this.quizz.rowCorrect(index)) {
        this.completedRow.push(index);
      }
    });

  }

  endToday() {
    const numberOfCorrectRows = 0;
    this.localStorage.addStatistics(numberOfCorrectRows);
    this.info();
  }

  addRowToQuizz(row, index) {
    const rowInfo = this.setRowInfo(row, index);
    this.quizz.setUserValue(row, index, rowInfo);
  }

  setRowInfo(row, index) {
    let numPositionCorrect = 0;
    let numCorrect = 0;

    [...row].forEach((userNum, userIndex) => {
      [...this.numbersOfTheDay[index]].forEach((numberOfDay, dayIndex) => {
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
    this.openModal(InfoModalComponent, 'info');
  }

  settings() {
    this.openModal(SettingsModalComponent);
  }

  async openModal(com, css = '') {
    if(this.modalOpen) {
      return;
    }

    this.modalOpen = true;
    const modal = await this.modalController.create({
      component: com,
      cssClass: css
    });
    await modal.present();
    this.modalOpen = false;
  }

  select(val) {
    if(!this.running || this.completedRow.includes(val.row)) {
      return;
    } else if(!this.selectedChar) {
      if(this.auxChar) {
        this.unToggleLastValues();
      }
      this.selectedChar = { ...val };
      return;
    } else if( val.col === this.selectedChar.col && val.row === this.selectedChar.row) {
      this.selectedChar = null;
      return;
    }
    this.quizz.toggleCheckCell(val.row, val.col);
    this.quizz.toggleCheckCell(this.selectedChar.row, this.selectedChar.col);

    this.selectedCharAux = { ...this.selectedChar };
    this.auxChar = val;

    this.changePositions(val);
    this.selectedChar = null;
  }

  unToggleLastValues() {
      this.quizz.toggleCheckCell(this.auxChar.row, this.auxChar.col);
      this.quizz.toggleCheckCell(this.selectedCharAux.row, this.selectedCharAux.col);
  }

  changePositions(val: any) {
    const row1 = this.userNumbers[val.row];
    const row1Arr = row1.split('');
    const row2 = this.userNumbers[this.selectedChar.row];
    const row2Arr = row2.split('');

    const letter2 = row2Arr[this.selectedChar.col];
    row2Arr[this.selectedChar.col] = row1Arr[val.col];
    row1Arr[val.col] = letter2;

    if(val.row === this.selectedChar.row) {
      row2Arr[val.col] = letter2;
    }

    this.addRowToQuizz(row1Arr.join(''), val.row);
    this.addRowToQuizz(row2Arr.join(''), this.selectedChar.row);

    this.userNumbers[val.row] = row1Arr.join('');
    this.userNumbers[this.selectedChar.row] = row2Arr.join('');
    this.localStorage.addBoard(this.userNumbers);

    if(this.quizz.rowCorrect(val.row)) {
      this.completedRow.push(val.row);
    }
    if(this.quizz.rowCorrect(this.selectedChar.row)) {
      this.completedRow.push(this.selectedChar.row);
    }

    if(this.quizz.numCorrectRows().length === 7) {
      this.timeOut();
    }
  }

  timeOut() {
    this.finish = true;
    this.running = false;
    clearInterval(this.timerRef);
    this.localStorage.setRemainingTime(0);
    this.localStorage.addStatistics(this.quizz.numCorrectRows().length);
    this.counter.setMinutes(0);
    this.counter.setSeconds(0);
    this.info();
  }

  startTimer() {
    let remaining = this.localStorage.getRemainingTime();
    this.counter = new Date(this.counter.getTime() + remaining);
    this.timerRef = setInterval(() => {
      this.counter = new Date(this.counter.getTime() - millisecondsOnOneSecond);
      remaining -= millisecondsOnOneSecond;
      this.localStorage.setRemainingTime(remaining);
      if(this.counter.getMinutes() > 50) {
        this.timeOut();
      }
    }, millisecondsOnOneSecond);
  }
}
