import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { QuizzInfo } from '../core/model/quiz-info.model';

const millisecondsOnADay = 86400000;
const millisecondsOnFiveMinutes = 300000;

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
      const solutionCrypt = CryptoJS.AES.encrypt(JSON.stringify(quiz.codes).trim(), this.encryptSecretKey.trim()).toString();
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
    const encryptCodes = CryptoJS.AES.decrypt(val.trim(), this.encryptSecretKey.trim()).toString(CryptoJS.enc.Utf8);
    const codes = JSON.parse(encryptCodes);
    return new QuizzInfo({date, codes, nextDate: new Date(date.getTime() + millisecondsOnADay)});
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
    localStorage.setItem('board', JSON.stringify(conbination));
  }

  resetQuizz() {
    localStorage.setItem('board', JSON.stringify([]));
    localStorage.setItem('remaining', JSON.stringify(millisecondsOnFiveMinutes));
  }

  getBoard() {
    return JSON.parse(localStorage.getItem('board'));
  }

  setRemainingTime(time) {
    localStorage.setItem('remaining', JSON.stringify(time));
  }

  getRemainingTime() {
    return JSON.parse(localStorage.getItem('remaining')) || millisecondsOnFiveMinutes;
  }

  getTodaysQuery() {
    const quizz = this.getQuizz();
    if(!quizz || this.getNowUTC() > quizz.nextDate) {
      this.http.get(this.backEnd).subscribe( (res: any) => {
        this.resetQuizz();
        this.setQuizz(res);
        this.newQuizz$.next(new QuizzInfo({...res, nextDate: new Date(new Date(res.date).getTime() + millisecondsOnADay)}));
      }, (error) => {
        console.error(error);
      });
    } else {
      this.newQuizz$.next(new QuizzInfo(quizz));
    }
  }

  public getNowUTC() {
    const now = new Date();
    return new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
  }
}
