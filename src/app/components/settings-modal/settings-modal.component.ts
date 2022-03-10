import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LocalStorageService } from 'src/app/service/local-storage.service';

@Component({
  selector: 'app-settings-modal',
  templateUrl: './settings-modal.component.html',
  styleUrls: ['./settings-modal.component.scss'],
})
export class SettingsModalComponent {

  darkMode = false;

  constructor(private localStorage: LocalStorageService,
    private modalController: ModalController) {
    this.darkMode = this.localStorage.getDarkMode();
  }

  closeModal() {
    this.modalController.dismiss();
  }

  darkModeToggle() {
    document.body.classList.toggle('dark', this.darkMode);
    this.localStorage.setDarkMode(this.darkMode);
  }
}
