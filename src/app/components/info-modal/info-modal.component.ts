import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LocalStorageService } from 'src/app/service/local-storage.service';

const millisecondsOnADay = 86400000;

@Component({
  selector: 'app-info-modal',
  templateUrl: './info-modal.component.html',
  styleUrls: ['./info-modal.component.scss'],
})
export class InfoModalComponent implements OnDestroy {
  time: string;
  stats = [];
  played = 0;
  won = 0;
  percentage: any = [...Array(6).keys()];
  timerDate: Date;
  timerRef: any;
  nextQuizzDate: Date = new Date();

  constructor(private modalController: ModalController,
    private localStorage: LocalStorageService) {
    this.nextQuizzDate = new Date(this.localStorage.getDate().getTime() + millisecondsOnADay);
    this.setTimer();

    this.stats = this.localStorage.getStadistics();
    this.played = this.stats.length;
    this.won = this.stats.filter( p => p <= 5).length;

    this.percentage = this.percentage.map( per => ({num: per, progress: [...this.progress(per)]}) );
    console.log(this.percentage);
  }
  ngOnDestroy(): void {
    clearInterval(this.timerRef);
  }

  closeModal() {
    this.modalController.dismiss();
  }

  progress(pos: number) {
    const num = Math.round(this.stats.filter( p => p === pos).length / this.stats.length * 10) || 0;
    return Array(num).keys();
  }

  setTimer() {
    this.timerRef = setInterval(() => {
      const now = new Date();
      const millisecondsTillNextDate = this.nextQuizzDate.getTime() - now.getTime();
      now.setHours(0);
      now.setMinutes(0);
      now.setSeconds(0);
      now.setMilliseconds(0);
      this.timerDate = new Date(now.getTime() + millisecondsTillNextDate);
    }, 1000);
  }
}
