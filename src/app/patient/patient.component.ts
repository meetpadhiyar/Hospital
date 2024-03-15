import { Component, OnInit, ViewChild } from '@angular/core';
import { IonModal, IonicModule, NavController } from '@ionic/angular';
import { CommonService } from '../services/common.service';
import { BackendService } from '../services/backend.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-patient',
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.scss'],
  imports: [IonicModule, FormsModule, ReactiveFormsModule, DatePipe],
  providers: [CommonService, BackendService, DatePipe]
})
export class PatientComponent  implements OnInit {

  @ViewChild(IonModal) modal: IonModal;

  userId: number | string;
  tableData = [];
  tableDataCopy = [];

  feesDropdown = [];

  currentPatientId: string | number;

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

  constructor(public navCtrl: NavController, private service: CommonService, private backend: BackendService, private datepipe: DatePipe) { }
  
  ngOnInit() {}

  ionViewWillEnter() {
    this.form.controls['IsAnyDisease'].valueChanges.subscribe(val => {
      if(val == false) {
        this.form.controls['OtherDisease'].setValue('');
      }
    });
    let info: any = JSON.parse(localStorage.getItem('userInfo'));
    this.userId = info.UserId;
    this.loadTable();
  }

  loadTable() {
    Promise.all([
      this.backend.PostRequest('Patient/GetAllPatientsDetails', { UserId: this.userId }),
      this.backend.PostRequest('Patient/GetPaitentDropDown', { })
    ]).then(([res1, res2]) => {
      if(res1.isSuccessful) {
        this.tableData = res1.data;
        this.tableDataCopy = res1.data;
      }
      else {
        this.service.presentToast(res1.message, 'warning-outline', 'danger');
      }
      if(res2.isSuccessful) {
        this.feesDropdown = res2.data;
      }
      else {
        this.service.presentToast(res2.message, 'warning-outline', 'danger');
      }
    }).catch(() => {
      this.service.presentToast('Something went wrong', 'warning-outline', 'danger');
    });
  }

  getPatientsById(PatientId: string | number) {
    this.backend.PostRequest('Patient/GetPatientsById', { PatientId }).then(res => {
      if(res.isSuccessful) {
        this.form.patchValue(res.data[0]);
        this.form.controls['CheckupDate'].setValue(this.datepipe.transform(this.form.controls['CheckupDate'].value, 'yyyy-MM-dd'));
        this.modal.present();
        this.currentPatientId = PatientId;
      }
      else {
        this.service.presentToast(res.message, 'warning-outline', 'danger');
      }
    }).catch((e) => {
      console.log(e);
      this.service.presentToast('Something went wrong', 'warning-outline', 'danger');
    });
  }

  search(event: any) {
    setTimeout(() => {
      let searchQuery = event.target.value;
      this.tableDataCopy = this.tableData.filter(item => {
        const itemString = JSON.stringify(item).toLowerCase();
        return itemString.includes(searchQuery.toLowerCase());
      });
    }, 500);
  }

  getFeesType(FeesId: string | number) {
    if(FeesId == undefined) {
      return '';
    }
    let fees = this.feesDropdown.find(i => i.FeesId == FeesId);
    return fees.Fees;
  }

  validateForm() {
    if(this.form.invalid) {
      this.service.presentToast('Please enter valid credentials', 'warning-outline', 'danger');
    }
    else if(this.form.controls['MobileNumber'].value.toString().length != 10) {
      this.service.presentToast('Phone number should be 10 digits', 'warning-outline', 'danger');
    }
    else {
      this.updateForm();
    }
  }

  updateForm() {
    let data: any = this.form.value;
    data.MobileNumber = data.MobileNumber.toString();
    data.PatientId = this.currentPatientId;
    this.backend.PostRequest('Patient/UpdatePatientsDetails', data).then(res => {
      if(res.isSuccessful) {
        this.service.presentToast(res.message, 'checkmark-done', 'purple');
        this.form.reset();
        this.modal.dismiss();
        this.loadTable();
      }
      else {
        this.service.presentToast(res.message, 'warning-outline', 'danger');
      }
    }).catch(() => {
      this.service.presentToast('Something went wrong', 'warning-outline', 'danger');
    });
  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

}
