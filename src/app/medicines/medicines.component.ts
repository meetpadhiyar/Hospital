import { Component, OnInit, ViewChild } from '@angular/core';
import { IonModal, IonicModule, NavController } from '@ionic/angular';
import { CommonService } from '../services/common.service';
import { BackendService } from '../services/backend.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-medicines',
  templateUrl: './medicines.component.html',
  styleUrls: ['./medicines.component.scss'],
  imports: [IonicModule, FormsModule, ReactiveFormsModule, DatePipe],
  providers: [CommonService, BackendService, DatePipe]
})
export class MedicinesComponent  implements OnInit {

  @ViewChild(IonModal) modal: IonModal;

  medicineCompanyDropdown = [];
  uomDropdown = [];
  userId = '';
  currentMedicineId: string | number;

  tableData = [];
  tableDataCopy = [];

  updateForm = new FormGroup({
    MedicineName: new FormControl('', Validators.required),
    PurchaseRate: new FormControl('', Validators.required),
    SaleRate: new FormControl('', Validators.required),
    Discount: new FormControl(''),
    ExpirayDate: new FormControl('', Validators.required),
    MedicineCompanyId: new FormControl('', Validators.required),
    UoMId: new FormControl('', Validators.required),
    MinimumStock: new FormControl('', Validators.required),
    Remark: new FormControl('')
  });

  constructor(public navCtrl: NavController,
    private common: CommonService,
    private backend: BackendService, 
    private datepipe: DatePipe) { }

  ngOnInit() {}

  ionViewWillEnter() {
    let info: any = JSON.parse(localStorage.getItem('userInfo'));
    this.userId = info.UserId.toString();
    this.loadData();
  }

  loadData() {
    Promise.all(
      [
        this.backend.PostRequest('Medicine/GetAllMedicine', {}),
        this.backend.PostRequest('Medicine/GetAllMedicineDropDown', {})
      ]
    ).then(([res1, res2]) => {
      if(res1.isSuccessful) {
        this.tableData = res1.data;
        this.tableDataCopy = res1.data;
      }
      else{
        this.common.presentToast(res1.message, 'warning-outline', 'danger');
      }

      if(res2.isSuccessful) {
        this.medicineCompanyDropdown = res2.data.MedicineCompany;
        this.uomDropdown = res2.data.UOM;
      }
      else {
        this.common.presentToast(res2.message, 'warning-outline', 'danger');
      }
    }).catch(() => {
      this.common.presentToast('Something went wrong', 'warning-outline', 'danger');
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

  setUpdateForm(MedicineId: string | number) {
    this.currentMedicineId = MedicineId;
    this.backend.PostRequest('Medicine/GetMedicineById', { MedicineId: MedicineId }).then(res => {
      if(res.isSuccessful) {
        this.updateForm.patchValue(res.data[0]);
        this.updateForm.controls['ExpirayDate'].setValue(this.datepipe.transform(this.updateForm.controls['ExpirayDate'].value, 'yyyy-MM-dd'));
        this.modal.present();
      }
      else {
        this.common.presentToast(res.message, 'warning-outline', 'danger');
      }
    }).catch(() => {
      this.common.presentToast('Something went wrong', 'warning-outline', 'danger');
    });
  }

  validateUpdateForm() {
   if(this.updateForm.invalid) {
    
   }
   else {
    this.submitUpdateForm();
   }
  }

  submitUpdateForm() {
    let data: any = this.updateForm.value;
    data.UserId = this.userId;
    data.MedicineId = this.currentMedicineId;
    data.firstUnit = this.updateForm.controls['Discount'].value.toString().trim() == '' ? 0 : this.updateForm.controls['Discount'].value;
    this.backend.PostRequest('Medicine/UpdateMedicine', data).then(res => {
      if(res.isSuccessful) {
        this.common.presentToast(res.message, 'checkmark-done', 'purple');
        this.updateForm.reset();
        this.closeModal();
        this.loadData();
      }
      else {
        this.common.presentToast(res.message, 'warning-outline', 'danger');
      }
    }).catch(() => {
      this.common.presentToast('Something went wrong', 'warning-outline', 'danger');
    });
  }

  closeModal() {
    this.modal.dismiss(null, 'cancel');
  }

}
