import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { BackendService } from '../services/backend.service';
import { CommonService } from '../services/common.service';



@Component({
  selector: 'app-dignosis',
  templateUrl: './dignosis.component.html',
  styleUrls: ['./dignosis.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, ReactiveFormsModule],
  providers: [CommonService, BackendService, DatePipe]
})
export class DignosisComponent implements OnInit {

  paitentDropdown = [];
  medicineCompanyDropdown = [];
  intakeDropdown = [];
  userId: number | string;
  showNextCheckupDateInput = false;
  showTimingINtakeDropdowns = false;
  selectedTimings: string[] = [];
  selectedMedicin: any = {};
  selectedMedicineTable = [];
  selectedIntake: string | number;
  Days: number;
  Qty: number;
  Remarks: string;

  constructor(public navCtrl: NavController, private datepipe: DatePipe,
    private common: CommonService,
    private backend: BackendService,
  ) { }

  form = new FormGroup({
    PaitentyId: new FormControl('', Validators.required),
    CheckupDate: new FormControl('', Validators.required),
    Diagnosis: new FormControl('', Validators.required),
    Adviced: new FormControl(''),
    IsNextVisitRequires: new FormControl('1'),
    NextVisitDate: new FormControl('')
  });

  ngOnInit() { }

  ionViewWillEnter() {
    let info: any = JSON.parse(localStorage.getItem('userInfo'));
    this.userId = info.UserId;
    this.form.controls['CheckupDate'].setValue(this.datepipe.transform(new Date(), 'yyyy-MM-dd'));
    this.form.controls['NextVisitDate'].setValue(this.datepipe.transform(new Date(), 'yyyy-MM-dd'));
    this.form.controls['IsNextVisitRequires'].valueChanges.subscribe(val => {
      if(val == '1') {
        this.showNextCheckupDateInput = false;
      }
      else {
        this.showNextCheckupDateInput = true;
      }
    });
    this.loadDropDown();
  }

  loadDropDown() {
    this.backend.PostRequest('Diagnosis/GetDiagnosisDropDown', {}).then((res1) => {
      if (res1.isSuccessful) {
        this.paitentDropdown = res1.data.Patients;
        this.intakeDropdown = res1.data.Intake;
        this.medicineCompanyDropdown = res1.data.Medicine;
      }
      else {
        this.common.presentToast(res1.message, 'warning-outline', 'danger');
      }
    }).catch(() => {
      this.common.presentToast('Something went wrong', 'warning-outline', 'danger');
    });
  }

  validateForm() {
    console.log(this.selectedTimings);
    if(this.form.invalid) {
      this.common.presentToast('Form is Invalid', 'warning-outline', 'danger');
    }
    else if(this.selectedMedicineTable.length <= 0) {
      this.common.presentToast('Form is Invalid', 'warning-outline', 'danger');
    }
    else {
      this.submitForm();
    } 
  }

  submitForm() {
    let data: any = this.form.value;
    data.UserId = this.userId;
    data.DiagnosisId = 0;
    data.uT_DiagnosisMedicines = this.selectedMedicineTable;
    this.backend.PostRequest('Diagnosis/AddDiagnosis', data).then(res => {
      if(res.isSuccessful) {
        this.common.presentToast(res.message, 'checkmark-done', 'purple');
        this.form.reset;
        this.selectedMedicineTable = [];
        this.loadDropDown();
      }
      else {
        this.common.presentToast(res.message, 'warning-outline', 'danger');
      }
    }).catch(() => {
      this.common.presentToast('Something went wrong', 'warning-outline', 'danger');
    });
  }

  medicinSelected(event: any) {
    let medicine = this.medicineCompanyDropdown.find(item => item.Medicine == event.target.value);
    this.selectedMedicin = medicine;
    this.showTimingINtakeDropdowns = true;
  }

  addRowToTable() {
    let selectedIntakeObj = this.intakeDropdown.find(item => item.IntakeId == this.selectedIntake);
    let timingObj: Timings = {
      MorningMedicine: false,
      NoonMedicine: false,
      EveningMedicine: false,
      NightMedicine: false
    };
    for(let i of this.selectedTimings) {
      if(i == 'MorningMedicine') {
        timingObj.MorningMedicine = true;
      }
      if(i == 'NoonMedicine') {
        timingObj.NoonMedicine = true;
      }
      if(i == 'EveningMedicine') {
        timingObj.EveningMedicine = true;
      }
      if(i == 'NightMedicine') {
        timingObj.NightMedicine = true;
      }
    }
    let row: any = {};
    for(let i in this.selectedMedicin) {
      row[i] = this.selectedMedicin[i];
    }
    for(let i in timingObj) {
      row[i] = timingObj[i];
    }
    for(let i in selectedIntakeObj) {
      row[i] = selectedIntakeObj[i];
    }
    row['Days'] = this.Days;
    row['Qty'] = this.Qty;
    row['Remarks'] = this.Remarks;
    
    this.Days = 0;
    this.Qty = 0;
    this.Remarks = '';
    this.selectedTimings = [];
    this.selectedIntake = '';
    this.selectedMedicineTable.push(row);
  }

}


interface Timings {
  MorningMedicine: boolean,
  NoonMedicine: boolean,
  EveningMedicine: boolean,
  NightMedicine: boolean
}