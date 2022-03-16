import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { HelpModalComponent } from '../components/help-modal/help-modal.component';
import { InfoModalComponent } from '../components/info-modal/info-modal.component';
import { SettingsModalComponent } from '../components/settings-modal/settings-modal.component';
import { Quizz, Row, RowInfo } from '../quiz.class';
import { LocalStorageService } from '../service/local-storage.service';

const millisecondsOnOneSecond = 1000;
const millisecondsOnFiveMinutes = 300000;

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
  counter: Date = new Date();
  timerRef: any;
  running = false;

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

      if(this.localStorage.getRemainingTime() < millisecondsOnFiveMinutes) {
        this.start();
      }
    });
  }

  start() {
    this.running = true;
    this.userNumbers = [...this.numbersOfTheDay];
    this.loadTodaysBoard();
    this.localStorage.addBoard(this.userNumbers);
    this.startTimer();
  }

  disorderArray(arr) {
    const codes = arr.join('').split('');

    let currentIndex = codes.length;
    const res = [];

    while (currentIndex !== 0) {
      const randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [codes[currentIndex], codes[randomIndex]] = [
        codes[randomIndex], codes[currentIndex]];
    }
    for(let i = 0; i < codes.length; i ++) {
      const actualPosition = i * this.difficulty;
      res.push(codes.slice(actualPosition, actualPosition + this.difficulty).join(''));
    }
    return res.filter( ar => ar);
  }

  loadTodaysBoard() {
    let rows = this.localStorage.getBoard();
    if(!rows || !rows.length) {
      this.userNumbers = this.disorderArray(this.userNumbers);
      rows = [...this.userNumbers];
    } else {
      this.userNumbers = [...rows];
    }

    rows.forEach( (row, index) => {
      this.addRowToQuizz(row, index);
    });
  }

  endToday() {
    const numberOfCorrectRows = 0;
    this.localStorage.addStatistics(numberOfCorrectRows);
    this.info();
  }

  addRowToQuizz(row, index) {
    const rowInfo = this.setRowInfo(row, index);
    this.quizz.setUserValue(row, rowInfo, index);
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

  select(val) {
    if(this.finish) {
      return;
    } else if(!this.selectedChar) {
      this.selectedChar = { ...val };
      return;
    } else if( val.col === this.selectedChar.col && val.row === this.selectedChar.row) {
      this.selectedChar = null;
      return;
    }

    this.changePositions(val);
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
    this.selectedChar = null;
    this.localStorage.addBoard(this.userNumbers);

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
      if(this.counter.getMinutes() > 50) {
        this.timeOut();
      }
      this.counter = new Date(this.counter.getTime() - millisecondsOnOneSecond);
      remaining -= millisecondsOnOneSecond;
      this.localStorage.setRemainingTime(remaining);
    }, millisecondsOnOneSecond);
  }
}
