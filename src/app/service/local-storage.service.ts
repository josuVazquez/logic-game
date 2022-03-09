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

    const unEncrypted = CryptoJS.AES.decrypt(data, this.encryptSecretKey);
    return unEncrypted;
  }

  setSolution(solution) {
    try {
      const solutionCrypt = CryptoJS.AES.encrypt(JSON.stringify(solution), this.encryptSecretKey).toString();
      localStorage.setItem('solution', solutionCrypt);
    } catch (e) {
      console.log(e);
    }
  }

  addStatistics(num) {
    const statistics = JSON.parse(localStorage.getItem('statistics')) || [];
    statistics.push(num);
    localStorage.setItem('statistics', JSON.stringify(statistics));
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
    this.http.get(this.backEnd);
  }
}
