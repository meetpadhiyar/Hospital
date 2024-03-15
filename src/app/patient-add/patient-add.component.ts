import { Component, OnInit } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';
import { CommonService } from '../services/common.service';
import { BackendService } from '../services/backend.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-patient-add',
  templateUrl: './patient-add.component.html',
  styleUrls: ['./patient-add.component.scss'],
  imports: [IonicModule, FormsModule, ReactiveFormsModule],
  providers: [CommonService, BackendService, DatePipe]
})
export class PatientAddComponent  implements OnInit {

  constructor(public navCtrl: NavController, private service: CommonService, private backend: BackendService, private datepipe: DatePipe) { }

  feesDropdown = [];

  form = new FormGroup({
    FullName: new FormControl('', Validators.required),
    FeesId: new FormControl('', Validators.required),
    Disease: new FormControl('', Validators.required),
    MobileNumber: new FormControl('', Validators.required),
    City: new FormControl('', Validators.required),
    Gender: new FormControl('', Validators.required),
    Age: new FormControl('', Validators.required),
    Height: new FormControl('', Validators.required),
    Weight: new FormControl('', Validators.required),
    IsAnyDisease: new FormControl(false),
    OtherDisease: new FormControl(''),
    PartnerName: new FormControl(''),
    IsEmergency: new FormControl(false),
    Remark: new FormControl(''),
    CheckupDate: new FormControl('', Validators.required),
  });

  ngOnInit() {}

  ionViewWillEnter() {
    this.form.controls['IsAnyDisease'].valueChanges.subscribe(val => {
      if(val == false) {
        this.form.controls['OtherDisease'].setValue('');
      }
    });
    this.form.controls['CheckupDate'].setValue(this.datepipe.transform(new Date(), 'yyyy-MM-dd'));
    this.loadFeesFropdown();
  }

  loadFeesFropdown() {
    this.backend.PostRequest('Patient/GetPaitentDropDown', { }).then(res => {
      if(res.isSuccessful) {
        this.feesDropdown = res.data;
      }
      else {
        this.service.presentToast(res.message, 'warning-outline', 'danger');
      }
    }).catch(() => {
      this.service.presentToast('Something went wrong', 'warning-outline', 'danger');
    });
  }

  validateForm() {
    if(this.form.invalid) {
      this.service.presentToast('Please enter valid credentials', 'warning-outline', 'danger');
    }
    else if(this.form.controls['MobileNumber'].value.toString().length != 10) {
      this.service.presentToast('Phone number should be 10 digits', 'warning-outline', 'danger');
    }
    else {
      this.subitForm();
    }
  }

  subitForm() {
    let data = this.form.value;
    data.MobileNumber = data.MobileNumber.toString();
    this.backend.PostRequest('Patient/AddPatientsDetails', data).then(res => {
      if(res.isSuccessful) {
        this.service.presentToast(res.message, 'checkmark-done', 'purple');
        this.form.reset();
      }
      else {
        this.service.presentToast(res.message, 'warning-outline', 'danger');
      }
    }).catch(() => {
      this.service.presentToast('Something went wrong', 'warning-outline', 'danger');
    });
  }

}
