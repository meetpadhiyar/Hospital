import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { CommonService } from '../services/common.service';
import { BackendService } from '../services/backend.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  standalone: true,
  selector: 'app-hospital',
  templateUrl: './hospital.component.html',
  styleUrls: ['./hospital.component.scss'],
  imports: [IonicModule, FormsModule, ReactiveFormsModule],
  providers: [CommonService, BackendService]
})
export class HospitalComponent implements OnInit {

  companyLogo: any = '';
  file: string | SafeResourceUrl = '';
  selectedFile: any = '';
  companyId = '';
  UserId = '';
  form = new FormGroup({
    companyName: new FormControl('', Validators.required),
    Address: new FormControl('', Validators.required),
    Address2: new FormControl(''),
    City: new FormControl('', Validators.required),
    PinCode: new FormControl('', Validators.required),
    PhoneNumber1: new FormControl('', Validators.required),
    PhoneNumber2: new FormControl(''),
    GSTNumber: new FormControl('', Validators.required),
  });

  constructor(public navCtrl: NavController, private service: CommonService, private backend: BackendService, private sanitizer: DomSanitizer) { }

  ngOnInit() { }

  ionViewWillEnter() {
    let info: any = JSON.parse(localStorage.getItem('userInfo'));
    this.companyId = info.CompanyId.toString();
    this.UserId = info.UserId.toString();
    this.loadCompanyDetail();
  }

  loadCompanyDetail() {
    this.backend.PostRequest('Company/GetCompanyById', { CompanyId: this.companyId }).then(res => {
      if (res.isSuccessful) {
        this.form.patchValue(res.data[0]);
        this.file = res.data[0]?.CompanyLogo;
      }
      else {
        this.service.presentToast(res.message, 'warning-outline', 'danger');
      }
    }).catch(() => {
      this.service.presentToast('Something went wrong', 'warning-outline', 'danger');
    });
  }

  chooseImage(files: any) {
    let i = 0;
    Array.from(files.target.files).forEach((file: any) => {
      let name = (file.name.split(".")[file.name.split(".").length - 1]).toLowerCase();
      if (name == 'png' || name == 'jpeg' || name == 'jpg') {
        if (file.size <= 2097152) {
          this.file = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(file));
          this.selectedFile = file;
        }
        else {
          this.service.presentToast('Please add File less than or equal to 2MB', 'warning-outline', 'danger');
        }
      }
      else {
        files.target.value = "";
        this.service.presentToast('Please select png, jpg or jpeg type of file', 'warning-outline', 'danger');
      }
      i++;
    });
  }

  validateForm() {
    if (this.form.invalid) {
      this.service.presentToast('Please enter valid credentials', 'warning-outline', 'danger');
    }
    else if (this.form.controls['PhoneNumber1'].value.toString().length != 10) {
      this.service.presentToast('Phone number should be 10 digits', 'warning-outline', 'danger');
    }
    else if (this.form.controls['PhoneNumber2'].value.toString().trim() != '' && this.form.controls['PhoneNumber2'].value.toString().length != 10) {
      this.service.presentToast('Phone number 2 should be 10 digits', 'warning-outline', 'danger');
    }
    else {
      this.submitForm();
    }
  }

  submitForm() {
    let data: any = this.form.value;
    if (this.selectedFile != '') {
      data.CompanyLogo = this.selectedFile;
    }
    data.CompanyId = this.companyId;
    data.UserId = this.UserId;
    let formData = new FormData();
    for (let i in data) {
      formData.append(i, data[i]);
    }
    this.backend.PostRequest('Company/UpdateCompany', formData).then(res => {
      if (res.isSuccessful) {
        this.service.presentToast(res.message, 'checkmark-done', 'purple');
        this.loadCompanyDetail();
      }
      else {
        this.service.presentToast(res.message, 'warning-outline', 'danger');
      }
    }).catch(() => {
      this.service.presentToast('Something went wrong', 'warning-outline', 'danger');
    });
  }

}
