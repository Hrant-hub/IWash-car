import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.page.html',
  styleUrls: ['./terms.page.scss'],
  standalone: false,
})
export class TermsPage {
  constructor(private navCtrl: NavController) {}

  back(): void {
    this.navCtrl.back();
  }
}

