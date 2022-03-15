import { Component } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from './service/local-storage.service';
import { PushNotificationsService } from './service/push-notifications.service';

const millisecondsOnADay = 86400000;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  readonly vapidPublicKey = 'BE6REuttfHAIG-nGhDM9o3Hu-YgFfLmIEdQcGbGKWL5iF8n-n2iJxkCMr2RlB3x3XF8h1XL3vdw2zqn22Pz3wj4';

  constructor(private swPush: SwPush,
  private localStorage: LocalStorageService,
  private pushNotification: PushNotificationsService,
  private translate: TranslateService ) {
    translate.setDefaultLang(translate.currentLang);
    const darkMode = this.localStorage.getDarkMode();
    document.body.classList.toggle('dark', darkMode);
    this.localStorage.getTodaysQuery();
    this.subscribeToNotifications();
  }

  subscribeToNotifications() {
      this.swPush.requestSubscription({
          serverPublicKey: this.vapidPublicKey
      })
      .then(sub => {
        this.pushNotification.addSubscriber(sub);
      })
      .catch(err => console.error('Could not subscribe to notifications', err));
  }

}
