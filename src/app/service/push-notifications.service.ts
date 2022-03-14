import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationsService {
  backEnd = 'https://quizzbacknode.herokuapp.com/sub';

  constructor(private http: HttpClient) { }

  addSubscriber(sub) {
    return this.http.post(this.backEnd, sub);
  }
}
