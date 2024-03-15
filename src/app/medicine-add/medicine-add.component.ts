import { Component, OnInit } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';
import { CommonService } from '../services/common.service';
import { BackendService } from '../services/backend.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-medicine-add',
  templateUrl: './medicine-add.component.html',
  styleUrls: ['./medicine-add.component.scss'],
  imports: [IonicModule, FormsModule, ReactiveFormsModule],
  providers: [CommonService, BackendService, DatePipe]
})
export class MedicineAddComponent  implements OnInit {

  medicineCompanyDropdown = [];
  uomDropdown = [];
  userId = '';

  form = new FormGroup(
    {
      MedicineName: new FormControl('', Validators.required),
      PurchaseRate: new FormControl('', Validators.required),
      SaleRate: new FormControl('', Validators.required),
      Discount: new FormControl(''),
      ExpirayDate: new FormControl('', Validators.required),
      MedicineCompanyId: new FormControl('', Validators.required),
      UoMId: new FormControl('', Validators.required),
      MinimumStock: new FormControl('', Validators.required),
      Remark: new FormControl('')
    }
  );

  constructor(public navCtrl: NavController,
    private common: CommonService,
    private backend: BackendService, 
    private datepipe: DatePipe) { }

  ngOnInit() {}

  ionViewWillEnter() {
    let info: any = JSON.parse(localStorage.getItem('userInfo'));
    this.userId = info.UserId.toString();
    this.loadData();
    this.form.controls['ExpirayDate'].setValue(this.datepipe.transform(new Date(), 'yyyy-MM-dd'));
    this.form.controls['Discount'].setValue('0');
  }

  loadData() {  
    this.backend.PostRequest('Medicine/GetAllMedicineDropDown', {}).then(res => {
      if(res.isSuccessful) {
        this.medicineCompanyDropdown = res.data.MedicineCompany;
        this.uomDropdown = res.data.UOM;
      }
      else {
        this.common.presentToast(res.message, 'warning-outline', 'danger');
      }
    }).catch(() => {
      this.common.presentToast('Something went wrong', 'warning-outline', 'danger');
    });
  }

  validateForm() {
    if(this.form.invalid) {
      this.common.presentToast('Form Invalid', 'warning-outline', 'danger');
    }
    else {
      this.submitForm();
    }
  }

  submitForm() {
    let data: any = this.form.value;
    data.UserId = this.userId;
    data.MedicineId = 0;
    data.firstUnit = this.form.controls['Discount'].value.toString().trim() == '' ? 0 : this.form.controls['Discount'].value;
    this.backend.PostRequest('Medicine/AddMedicine', data).then(res => {
      if(res.isSuccessful) {
        this.common.presentToast(res.message, 'checkmark-done', 'purple');
        this.form.reset();
      }
      else {
        this.common.presentToast(res.message, 'warning-outline', 'danger');
      }
    }).catch(() => {
      this.common.presentToast('Something went wrong', 'warning-outline', 'danger');
    });
  }

}
