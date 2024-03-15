import { Component, ElementRef, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonService } from '../services/common.service';
import { BackendService } from '../services/backend.service';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [IonicModule, FormsModule, ReactiveFormsModule],
  providers: [CommonService, BackendService]
})
export class LoginComponent  implements OnInit {

  loginForm = new FormGroup({
    UserName: new FormControl('', Validators.required),
    Password: new FormControl('', Validators.required)
  });
  constructor(private common: CommonService, private backend: BackendService, private router: Router, private el: ElementRef) { }

  ngOnInit() {
  }

  login() {
    if(this.loginForm.invalid) {
      this.common.presentToast('Please enter valid credentials', 'warning-outline', 'danger');
    } 
    else {
      this.backend.PostRequest('UserAuthentication/UserAuthentication', this.loginForm.value).then(res => {
        if(res.isSuccessful) {
          this.common.presentToast('Login Success', 'checkmark-done', 'purple');
          this.loginForm.reset();
          localStorage.setItem('userInfo', JSON.stringify(res.data[0]));
          this.router.navigateByUrl('/');
        }
        else {
          this.common.presentToast(res.message, 'warning-outline', 'danger');
        }
      }).catch((e) => {
        console.log(e);
        this.common.presentToast('Something went wrong', 'warning-outline', 'danger');
      });
    }
  }

}
