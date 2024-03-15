import { Component, OnInit, ViewChild } from '@angular/core';
import { IonModal, IonicModule, NavController } from '@ionic/angular';
import { BackendService } from '../services/backend.service';
import { CommonService } from '../services/common.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-cure',
  templateUrl: './cure.component.html',
  styleUrls: ['./cure.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, ReactiveFormsModule],
})
export class CureComponent implements OnInit {

  @ViewChild(IonModal) modal: IonModal;

  form = new FormGroup({
    cure: new FormControl(''),
    FromAge: new FormControl(''),
    ToAge: new FormControl(''),
    Gender: new FormControl('1'),
    Remark: new FormControl('')
  });

  updateForm = new FormGroup({
    cure: new FormControl(''),
    FromAge: new FormControl(''),
    ToAge: new FormControl(''),
    Gender: new FormControl(''),
    Remarks: new FormControl('')
  });

  tableData = [];
  tableDataCopy = [];
  medicinsData = [];
  medicinsDataCopy = [];
  userId = '';
  currentCureId: string | number;
  showMedicines = false;
  showUpdateMedicines = false;

  constructor(public navCtrl: NavController, private service: CommonService, private backend: BackendService) { }

  ngOnInit() { }

  ionViewWillEnter() {
    let info: any = JSON.parse(localStorage.getItem('userInfo'));
    this.userId = info.UserId.toString();
    this.loadData();
  }

  loadData() {
    this.showMedicines = false;
    Promise.all([
      this.backend.PostRequest('Cure/GetCureDetails', { }),
      this.backend.PostRequest('Cure/GetMedicineCure', { })
    ]).then(([res1, res2]) => {
      if(res1.isSuccessful) {
        this.tableData = res1.data;
        this.tableDataCopy = res1.data;
      }
      else {
        this.service.presentToast(res1.message, 'warning-outline', 'danger');
      }

      if(res2.isSuccessful) {
        this.medicinsData = res2.data;
        for(let i of this.medicinsData) {
          i.checked = false;
        }
        this.medicinsDataCopy = res2.data;
      }
      else {
        this.service.presentToast(res2.message, 'warning-outline', 'danger');
      }
    }).catch(() => {
      this.service.presentToast('Something went wrong', 'warning-outline', 'danger');
    });
  }

  validateForm() {
    let anySelected = this.medicinsDataCopy.filter(item => item.checked == true);
    if (this.form.controls['Gender'].value.toString() == "") {
      this.service.presentToast(`Please Select Gender`, 'warning-outline', 'danger');
    }
    else if (this.form.controls["FromAge"].value.toString() === "" || this.form.controls["ToAge"].value.toString() === "") {
      this.service.presentToast(`From Age and To Age is Required`, 'warning-outline', 'danger');
    }
    else if (this.form.controls["cure"].value.toString().trim() === "") {
      this.service.presentToast(`Please Enter Cure Detail`, 'warning-outline', 'danger');
    }
    else if(anySelected.length == 0) {
      this.service.presentToast(`Please Select any medicins`, 'warning-outline', 'danger');
    }
    else {
      this.SubmitForm();
    }
  }

  SubmitForm() {
    let data: any = this.form.value;
    data.UserId = this.userId;
    let mIds = '';
    for(let i of this.medicinsDataCopy) {
      if(i.checked == true) {
        if(mIds == '') {
          mIds = i.MedicineId.toString();
        }
        else {
          mIds = mIds + ',' + i.MedicineId;
        }
      }
    }
    data.MedicineIds = mIds;

    this.backend.PostRequest('Cure/AddCureDetails', data).then(res => {
      if (res.isSuccessful) {
        this.service.presentToast(res.message, 'checkmark-done', 'purple');
        this.form.reset();
        this.loadData();
      }
      else {
        this.service.presentToast(res.message, 'warning-outline', 'danger');
      }
    }).catch(error => {
      console.error('Error occurred while submitting form:', error);
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

  serachMedicine(event: any) {
    setTimeout(() => {
      let searchQuery = event.target.value;
      this.medicinsDataCopy = this.medicinsData.filter(item => {
        const itemString = JSON.stringify(item).toLowerCase();
        return itemString.includes(searchQuery.toLowerCase());
      });
    }, 500);
  }

  setUpdateForm(cureId: number | string) {
    this.currentCureId = cureId;
    this.backend.PostRequest('Cure/GetCureDetailsById', { cureId }).then(res => {
      if(res.isSuccessful) {
        this.updateForm.patchValue(res.data[0]);
        let mds = res.data[0].MedicineIds.toString().split(',');
        for(let i of this.medicinsDataCopy) {
          for(let j of mds) {
            if(!i.checked) {
              if(i.MedicineId == j) {
                i.checked = true;
              }
            }
           }
        }
        this.modal.present();
      }
      else {
        this.service.presentToast(res.message, 'warning-outline', 'danger');
      }
    }).catch(() => {
      this.service.presentToast('Something went wrong', 'warning-outline', 'danger');
    });
  }

  validateUpdateForm() {
    if (this.updateForm.controls['Gender'].value.toString() == "") {
      this.service.presentToast(`Please Select Gender`, 'warning-outline', 'danger');
    }
    else if (this.updateForm.controls["FromAge"].value.toString() === "" || this.updateForm.controls["ToAge"].value.toString() === "") {
      this.service.presentToast(`From Age and To Age is Required`, 'warning-outline', 'danger');
    }
    else if (this.updateForm.controls["cure"].value.toString().trim() === "") {
      this.service.presentToast(`Please Enter Cure Detail`, 'warning-outline', 'danger');
    }
    else {
      this.updateRow();
    }
  }

  updateRow() {
    let data: any = this.updateForm.value;
    data.UserId = this.userId;
    data.cureId = this.currentCureId;
    let mIds = '';
    for(let i of this.medicinsDataCopy) {
      if(i.checked == true) {
        if(mIds == '') {
          mIds = i.MedicineId.toString();
        }
        else {
          mIds = mIds + ',' + i.MedicineId;
        }
      }
    }
    data.MedicineIds = mIds;
    
    this.backend.PostRequest('Cure/UpdateCureDetails', data).then(res => {
      if (res.isSuccessful) {
        this.service.presentToast(res.message, 'checkmark-done', 'purple');
        this.updateForm.reset();
        this.closeModal();
        this.loadData();
      }
      else {
        this.service.presentToast(res.message, 'warning-outline', 'danger');
      }
    }).catch(() => {
      this.service.presentToast('Something went wrong', 'warning-outline', 'danger');
    });
  }

  closeModal() {
    this.showUpdateMedicines = false;
    this.modal.dismiss();
  }

  hideShowMedicines() {
    if(this.showMedicines == true) {
      this.showMedicines = false;
    }
    else {
      this.showMedicines = true;
    }
  }

  hideShowUpdateMedicines() {
    if(this.showUpdateMedicines == true) {
      this.showUpdateMedicines = false;
    }
    else {
      this.showUpdateMedicines = true;
    }
  }

}
