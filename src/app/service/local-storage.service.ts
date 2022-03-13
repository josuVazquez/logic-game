import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  backEnd = 'https://quizzbacknode.herokuapp.com/quizz';
  encryptSecretKey = 'thisisasecretkey';
  board: Array<string>;
  statistics: Array<any>;
  solution: string;

  constructor(private http: HttpClient) { }

  getSolution() {
    const data = localStorage.getItem('solution');
    if (!data) {
      return;
    }

    return CryptoJS.AES.decrypt(data.trim(), this.encryptSecretKey.trim()).toString(CryptoJS.enc.Utf8);
  }

  setSolution(solution) {
    try {
      const solutionCrypt = CryptoJS.AES.encrypt(solution.trim(), this.encryptSecretKey.trim()).toString();
      localStorage.setItem('solution', solutionCrypt);
    } catch (e) {
      console.error(e);
    }
  }

  setDate(date) {
    try {
      const dateCrypt = CryptoJS.AES.encrypt(date.trim(), this.encryptSecretKey.trim()).toString();
      localStorage.setItem('date', dateCrypt);
    } catch (e) {
      console.error(e);
    }
  }

  getDate() {
    const data = localStorage.getItem('date');
    if (!data) {
      return;
    }

    return new Date(CryptoJS.AES.decrypt(data.trim(), this.encryptSecretKey.trim()).toString(CryptoJS.enc.Utf8));
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
    this.http.get(this.backEnd).subscribe( res => {
      this.setSolution(res[0].code);
      this.setDate(res[0].date);
    });
  }
}
