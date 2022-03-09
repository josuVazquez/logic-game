import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

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


  constructor(private modalController: ModalController) { 
    this.calculateDate();
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
    console.log(milliseconsToNextDay);
    this.date = new Date(milliseconsToNextDay);
  }
}
