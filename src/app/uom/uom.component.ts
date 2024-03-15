import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonModal, IonicModule, NavController } from '@ionic/angular';
import { CommonService } from '../services/common.service';
import { BackendService } from '../services/backend.service';

@Component({
  standalone: true,
  selector: 'app-uom',
  templateUrl: './uom.component.html',
  styleUrls: ['./uom.component.scss'],
  imports: [IonicModule, FormsModule, ReactiveFormsModule],
  providers: [CommonService, BackendService]
})
export class UomComponent  implements OnInit {

  @ViewChild("updateModal") updateModal: IonModal;

  userId = '';
  unitDropdown = [];
  tableData = [];
  tableDataCopy = [];
  currentUOMid: string | number = '';

  form = new FormGroup({
    uom: new FormControl(''),
    qtyPerUnit: new FormControl('', Validators.required),
    isCompoundUnit: new FormControl('0'),
    firstUnit: new FormControl(''),
    secondUnit: new FormControl('')
  });

  updateForm = new FormGroup({
    uom: new FormControl(''),
    qtyPerUnit: new FormControl('', Validators.required),
    isCompoundUnit: new FormControl('0'),
    firstUnit: new FormControl(''),
    secondUnit: new FormControl('')
  });

  constructor(public navCtrl: NavController, private service: CommonService, private backend: BackendService) { }

  ngOnInit() {}

  ionViewWillEnter() {
    let info: any = JSON.parse(localStorage.getItem('userInfo'));
    this.userId = info.UserId.toString();
    this.loadUnitDropdown();
  }

  ionViewDidEnter() {
    this.form.controls['isCompoundUnit'].valueChanges.subscribe(val => {
      this.form.controls['firstUnit'].reset();
      this.form.controls['secondUnit'].reset();
      this.form.controls['uom'].reset();
    });
  }

  loadUnitDropdown() {
    Promise.all([
      this.backend.PostRequest('UOMs/GetAllUOM', {}),
      this.backend.PostRequest('UOMs/GetUOMDropDown', {}),
    ]).then(([res1, res2]) => {
      if(res1.isSuccessful) {
        this.tableData = res1.data;
        this.tableDataCopy = res1.data;
      }
      else {
        this.service.presentToast(res1.message, 'warning-outline', 'danger');
      }

      if(res2.isSuccessful) {
        this.unitDropdown = res2.data;
      }
      else {
        this.service.presentToast(res2.message, 'warning-outline', 'danger');
      }
    }).catch(() => {
      this.service.presentToast('Something went wrong', 'warning-outline', 'danger');
    });
  }

  validateForm() {
    if(this.form.invalid) {
      this.service.presentToast('Please enter valid credentials', 'warning-outline', 'danger');
    }
    else if(this.form.controls['isCompoundUnit'].value == '1' && (this.form.controls['firstUnit'].value == this.form.controls['secondUnit'].value)) {
      this.service.presentToast(`First Unit and Second Unit can't same`, 'warning-outline', 'danger');
    }
    else if(this.form.controls['isCompoundUnit'].value == '0' && this.form.controls['uom'].value.toString().trim() == '') {
      this.service.presentToast('Please enter valid credentials', 'warning-outline', 'danger');
    }
    else {
      this.SubmitForm();
    }
  }

  SubmitForm() {
    let data: any = this.form.value;
    data.userId = this.userId;
    data.firstUnit = this.form.controls['firstUnit'].value.toString().trim() == '' ? 0 : this.form.controls['firstUnit'].value;
    data.secondUnit = this.form.controls['secondUnit'].value.toString().trim() == '' ? 0 : this.form.controls['secondUnit'].value;
    this.backend.PostRequest('UOMs/AddUOM', data).then(res => {
      if(res.isSuccessful) {
        this.service.presentToast(res.message, 'checkmark-done', 'purple');
        this.form.reset();
        this.form.controls['isCompoundUnit'].setValue('0');
        this.form.controls['uom'].setValue('');
        this.form.controls['firstUnit'].setValue('');
        this.form.controls['secondUnit'].setValue('');
        this.loadUnitDropdown();
      }
      else {
        this.service.presentToast(res.message, 'warning-outline', 'danger');
      }
    }).catch(() => {
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

  openUpdateModal(UOMId: string | number) {
    this.currentUOMid = UOMId;
    this.backend.PostRequest('UOMS/GetAllUOMById ', { UOMId }).then(res => {
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

  validateUpdateForm() {
    if(this.updateForm.invalid) {
      this.service.presentToast('Please enter valid credentials', 'warning-outline', 'danger');
    }
    else if(this.updateForm.controls['isCompoundUnit'].value == '1' && (this.updateForm.controls['firstUnit'].value == this.updateForm.controls['secondUnit'].value)) {
      this.service.presentToast(`First Unit and Second Unit can't same`, 'warning-outline', 'danger');
    }
    else if(this.updateForm.controls['isCompoundUnit'].value == '0' && this.updateForm.controls['uom'].value.toString().trim() == '') {
      this.service.presentToast('Please enter valid credentials', 'warning-outline', 'danger');
    }
    else {
      this.updateFormEntry();
    }
  }

  updateFormEntry() {
    let data: any = this.updateForm.value;
    data.userId = this.userId;
    data.firstUnit = this.updateForm.controls['firstUnit'].value.toString().trim() == '' ? 0 : this.updateForm.controls['firstUnit'].value;
    data.secondUnit = this.updateForm.controls['secondUnit'].value.toString().trim() == '' ? 0 : this.updateForm.controls['secondUnit'].value;
    data.uomId = this.currentUOMid;
    this.backend.PostRequest('UOMs/UpdateUOM', data).then(res => {
      if(res.isSuccessful) {
        this.service.presentToast(res.message, 'checkmark-done', 'purple');
        this.updateForm.reset();
        this.closeUpdateModal();
        this.loadUnitDropdown();
      }
      else {
        this.service.presentToast(res.message, 'warning-outline', 'danger');
      }
    }).catch(() => {
      this.service.presentToast('Something went wrong', 'warning-outline', 'danger');
    });
  }

}
