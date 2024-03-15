import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonModal, IonicModule, NavController } from '@ionic/angular';
import { CommonService } from '../services/common.service';
import { BackendService } from '../services/backend.service';

@Component({
  standalone: true,
  selector: 'app-medicine-company',
  templateUrl: './medicine-company.component.html',
  styleUrls: ['./medicine-company.component.scss'],
  imports: [IonicModule, FormsModule, ReactiveFormsModule],
  providers: [CommonService, BackendService]
})
export class MedicineCompanyComponent implements OnInit {

  @ViewChild("updateModal") updateModal: IonModal;

  userId = '';
  companyId = '';
  currentMCompanyId: string | number = '';
  tableData = [];
  tableDataCopy = [];

  form = new FormGroup({
    MCompany: new FormControl('', Validators.required),
    MobileNumber: new FormControl('', Validators.required),
    Address: new FormControl('', Validators.required),
    MRContactNumber: new FormControl(''),
    Remark: new FormControl('')
  });

  updateForm = new FormGroup({
    MCompany: new FormControl('', Validators.required),
    MobileNumber: new FormControl('', Validators.required),
    Address: new FormControl('', Validators.required),
    MRContactNumber: new FormControl(''),
    Remark: new FormControl('')
  });

  constructor(public navCtrl: NavController, private service: CommonService, private backend: BackendService) { }

  ngOnInit() { }

  ionViewWillEnter() {
    let info: any = JSON.parse(localStorage.getItem('userInfo'));
    this.userId = info.UserId.toString();
    this.companyId = info.CompanyId.toString();
    this.loadTableData();
  }

  loadTableData() {
    this.backend.PostRequest('MedicineCompany/GetAllMedicineCompany', {}).then(res => {
      if (res.isSuccessful) {
        this.tableData = res.data;
        this.tableDataCopy = res.data;
      }
      else {
        this.service.presentToast(res.message, 'warning-outline', 'danger');
      }
    }).catch(() => {
      this.service.presentToast('Something went wrong', 'warning-outline', 'danger');
    });
  }

  validateForm() {
    if (this.form.invalid) {
      this.service.presentToast('Please enter valid credentials', 'warning-outline', 'danger');
    }
    else if (this.form.controls['MobileNumber'].value.toString().length != 10) {
      this.service.presentToast('Phone number should be 10 digits', 'warning-outline', 'danger');
    }
    else if (this.form.controls['MRContactNumber'].value.toString().trim() != '' && this.form.controls['MRContactNumber'].value.toString().length != 10) {
      this.service.presentToast('MR Phone number should be 10 digits', 'warning-outline', 'danger');
    }
    else {
      this.submitForm();
    }
  }

  submitForm() {
    let data: any = this.form.value;
    data.MobileNumber = this.form.controls['MobileNumber'].value.toString();
    data.MRContactNumber = this.form.controls['MRContactNumber'].value.toString();
    data.UserId = this.userId;
    this.backend.PostRequest('MedicineCompany/AddMedicineCompany', data).then(res => {
      if (res.isSuccessful) {
        this.service.presentToast(res.message, 'checkmark-done', 'purple');
        this.form.reset();
        this.loadTableData();
      }
      else {
        this.service.presentToast(res.message, 'warning-outline', 'danger');
      }
    }).catch(() => {
      this.service.presentToast('Something went wrong', 'warning-outline', 'danger');
    });
  }

  openUpdateModal(MCompanyId: string | number) {
    this.currentMCompanyId = MCompanyId;
    this.backend.PostRequest('MedicineCompany/GetMedicineCompanyById', { MCompanyId }).then(res => {
      if(res.isSuccessful) {
        this.updateForm.patchValue(res.data[0]);
        this.updateModal.present();
      }
      else {
        this.service.presentToast(res.message, 'warning-outline', 'danger');
      }
    }).catch(() => {
      this.service.presentToast('Something went wrong', 'warning-outline', 'danger');
    });
  }

  closeUpdateModal() {
    this.updateForm.reset();
    this.updateModal.dismiss();
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

  validateUpdateForm() {
    if (this.updateForm.invalid) {
      this.service.presentToast('Please enter valid credentials', 'warning-outline', 'danger');
    }
    else if (this.updateForm.controls['MobileNumber'].value.toString().length != 10) {
      this.service.presentToast('Phone number should be 10 digits', 'warning-outline', 'danger');
    }
    else if (this.updateForm.controls['MRContactNumber'].value.toString().trim() != '' && this.updateForm.controls['MRContactNumber'].value.toString().length != 10) {
      this.service.presentToast('MR Phone number should be 10 digits', 'warning-outline', 'danger');
    }
    else {
      this.updateFormEntry();
    }
  }

  updateFormEntry() {
    let data: any = this.updateForm.value;
    data.UserId = this.userId;
    data.MobileNumber = this.updateForm.controls['MobileNumber'].value.toString();
    data.MRContactNumber = this.updateForm.controls['MRContactNumber'].value.toString();
    data.MCompanyId = this.currentMCompanyId;
    this.backend.PostRequest('MedicineCompany/UpdateMedicineCompany', data).then(res => {
      if (res.isSuccessful) {
        this.service.presentToast(res.message, 'checkmark-done', 'purple');
        this.updateForm.reset();
        this.closeUpdateModal();
        this.loadTableData();
      }
      else {
        this.service.presentToast(res.message, 'warning-outline', 'danger');
      }
    }).catch(() => {
      this.service.presentToast('Something went wrong', 'warning-outline', 'danger');
    });
  }

}
