import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  private showLoadingSubject = new BehaviorSubject<boolean>(true);
  showLoading$ = this.showLoadingSubject.asObservable();

  loading: HTMLIonLoadingElement;

  constructor(private toastCtrl: ToastController, 
    private loadingCtrl: LoadingController, 
    private alertControler: AlertController,
    private router: Router) { }

  setShowLoading(value: boolean) {
    this.showLoadingSubject.next(value);
  }

  async presentToast(message: string, icon: string = '', color: string = 'purple', time: number = 3000) {
    const toast = await this.toastCtrl.create({
      message: message,
      color: color,
      duration: time,
      icon: icon
    });
    await toast.present();
  }

  async presentLoading(text: string) {
    this.loading = await this.loadingCtrl.create({
      message: text,
      spinner: "bubbles",
      cssClass: ['custom-loading']
    });
    await this.loading.present();
  }

  async dismissLoading() {
    await this.loading?.dismiss();
  }

  async logout() {
    let alert = await this.alertControler.create({
       mode: 'ios',
       header: 'Confirm!',
       subHeader: 'are you sure you want to logout?',
       buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: ['alert-button']
        },
        {
          text: 'Yes',
          cssClass: ['alert-button'],
          handler: () => {
            localStorage.clear();
            this.router.navigateByUrl('login');
          }
        }
       ]
    });

    await alert.present();
  }

}
