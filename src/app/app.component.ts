import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { CommonService } from './services/common.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'hospital';
  userInfo: any = {};
  showSideenu = true;

  constructor(private platform: Platform, private router: Router, private service: CommonService) {
    this.platform.ready().then(() => {
      const hamBurger = document.querySelector(".toggle-btn");

      hamBurger.addEventListener("click", function () {
        document.querySelector("#sidebar").classList.toggle("expand");
      });
      if(localStorage.length <= 0) {
        this.showSideenu = false;
        this.router.navigateByUrl('login');
      }
      else {
        this.showSideenu = true;
        let userInfo: any = localStorage.getItem('userInfo');
        this.userInfo = JSON.parse(userInfo);
      }

      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe((event: NavigationEnd) => {
        if(event.url == '/login') {
          this.showSideenu = false;
        }
        else {
          this.showSideenu = true;
        }
      });
    });
  }

  changeRoute(route: string) {
    this.router.navigateByUrl(route);
  }

  logout() {
    this.service.logout();
  }
}
