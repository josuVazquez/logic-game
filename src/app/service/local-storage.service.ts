import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { QuizzInfo } from '../core/model/quiz-info.model';

const millisecondsOnADay = 86400000;

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  backEnd = 'https://quizzbacknode.herokuapp.com/quizz';
  encryptSecretKey = 'thisisasecretkey';
  board: Array<string>;
  statistics: Array<any>;

  newQuizz$ = new BehaviorSubject<QuizzInfo>(new QuizzInfo());

  constructor(private http: HttpClient) { }

  setQuizz(quiz) {
    try {
      const solutionCrypt = CryptoJS.AES.encrypt(quiz.code.trim(), this.encryptSecretKey.trim()).toString();
      const dateCrypt = CryptoJS.AES.encrypt(quiz.date.trim(), this.encryptSecretKey.trim()).toString();
      localStorage.setItem('date', dateCrypt);
      localStorage.setItem('solution', solutionCrypt);
    } catch (e) {
      console.error(e);
    }
  }

  getQuizz() {
    const val = localStorage.getItem('solution');
    const dat = localStorage.getItem('date');

    if(!val || !dat) {
      return;
    }

    const date = new Date(CryptoJS.AES.decrypt(dat.trim(), this.encryptSecretKey.trim()).toString(CryptoJS.enc.Utf8));
    const code = CryptoJS.AES.decrypt(val.trim(), this.encryptSecretKey.trim()).toString(CryptoJS.enc.Utf8);
    return new QuizzInfo({date, code, nextDate: new Date(date.getTime() + millisecondsOnADay)});
  }

  setDarkMode(darkMode: boolean) {
    localStorage.setItem('darkMode', '' + darkMode);
  }

  getDarkMode() {
    return JSON.parse(localStorage.getItem('darkMode')) || false;
  }

  addStatistics(num) {
    const statistics = JSON.parse(localStorage.getItem('statistics')) || [];
    statistics.push(num);
    localStorage.setItem('statistics', JSON.stringify(statistics));
  }

  getStadistics() {
    return JSON.parse(localStorage.getItem('statistics')) || [];
  }

  addBoard(conbination) {
    const board = JSON.parse(localStorage.getItem('board')) || [];
    board.push(conbination);
    localStorage.setItem('board', JSON.stringify(board));
  }

  resetBoard() {
    localStorage.setItem('board', JSON.stringify([]));
  }

  getBoard() {
    return JSON.parse(localStorage.getItem('board'));
  }

  getTodaysQuery() {
    const quizz = this.getQuizz();
    if(!quizz || new Date() > new Date( quizz.date.getTime() + millisecondsOnADay)) {
      this.http.get(this.backEnd).subscribe( (res: any) => {
        this.setQuizz(res);
        this.newQuizz$.next(new QuizzInfo({...res, nextDate: new Date(new Date(res.date).getTime() + millisecondsOnADay)}));
        this.resetBoard();
      }, (error) => {
        console.error();
      });
    } else {
      this.newQuizz$.next(new QuizzInfo(quizz));
    }
  }
}
