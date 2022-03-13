import { Component } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { environment } from 'src/environments/environment';
import { LocalStorageService } from './service/local-storage.service';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  readonly validPublicKey = 'BLBx-hf2WrL2qEa0qKb-aCJbcxEvyn62GDTyyP9KTS5K7ZL0K7TfmOKSPqp8vQF0DaG8hpSBknz_x3qf5F4iEFo';
  message: any = null;

  constructor(private localStorage: LocalStorageService,
    private swPush: SwPush) {
    const darkMode = this.localStorage.getDarkMode();
    document.body.classList.toggle('dark', darkMode);
    this.localStorage.getTodaysQuery();

    this.requestPermission();
    this.listen();
  }

  requestPermission() {
    const messaging = getMessaging();
    getToken(messaging,
     { vapidKey: environment.firebaseConfig.vapidKey}).then(
       (currentToken) => {
         if (currentToken) {
           console.log('Hurraaa!!! we got the token.....');
           console.log(currentToken);
         } else {
           console.log('No registration token available. Request permission to generate one.');
         }
     }).catch((err) => {
        console.log('An error occurred while retrieving token. ', err);
    });
  }

  listen() {
    const messaging = getMessaging();
    onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
      this.message = payload;
    });
  }

  subscribeToNotifications() {
    // this.swPush.requestSubscription({
    //     serverPublicKey: this.validPublicKey
    // })
    // .then(sub => this.newsletterService.addPushSubscriber(sub).subscribe())
    // .catch(err => console.error('Could not subscribe to notifications', err));
  }

  /*
  import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
  */
}
