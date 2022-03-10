import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LocalStorageService } from 'src/app/service/local-storage.service';

const hoursOfDay = 24;
const minutesOfDay = 60;
const secondsOfDay = 60;

@Component({
  selector: 'app-info-modal',
  templateUrl: './info-modal.component.html',
  styleUrls: ['./info-modal.component.scss'],
})
export class InfoModalComponent {
  date: Date = new Date();
  time: string;
  stats = [];
  played = 0;
  won = 0;
  percentage = [...Array(6).keys()];

  constructor(private modalController: ModalController,
    private localStorage: LocalStorageService) {
    this.calculateDate();
    this.stats = this.localStorage.getStadistics();
    this.played = this.stats.length;
    this.won = this.stats.filter( p => p <= 5).length;
  }

  closeModal() {
    this.modalController.dismiss();
  }

  calculateDate() {
    const now = new Date();

    const endDate = new Date();
    endDate.setHours(24);
    endDate.setMinutes(60);
    endDate.setSeconds(60);

    const milliseconsToNextDay = endDate.getTime() - now.getMilliseconds();
    this.date = new Date(milliseconsToNextDay);
  }

  progress(pos: number) {
    const num = Math.round(this.stats.filter( p => p === pos).length / this.stats.length * 10) || 0;
    return Array(num).keys();
  }

}
