import { Component, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LocalStorageService } from 'src/app/service/local-storage.service';

@Component({
  selector: 'app-info-modal',
  templateUrl: './info-modal.component.html',
  styleUrls: ['./info-modal.component.scss'],
})
export class InfoModalComponent implements OnDestroy {
  time: string;
  stats = [];
  played = 0;
  percentage: any = [...Array(8).keys()];
  timerDate: Date;
  timerRef: any;
  nextQuizzDate: Date = new Date();

  url = 'https://passcode-breaker.netlify.app';
  constructor(private modalController: ModalController,
    private localStorage: LocalStorageService) {

    this.localStorage.newQuizz$.subscribe( res => {
      this.nextQuizzDate = res.nextDate;
    });
    this.setTimer();

    this.stats = this.localStorage.getStadistics();
    this.played = this.stats.length;

    this.percentage = this.percentage.map( per => ({num: per, progress: [...this.progress(per)]}) );
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

  shareWhat() {
    const text = `https://api.whatsapp.com/send?text=Try this game: ${this.url}`;
    window.open(text, '_blank');
  }

}
