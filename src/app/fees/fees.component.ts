import { Component, OnInit } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';
import { CommonService } from '../services/common.service';
import { BackendService } from '../services/backend.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-fees',
  templateUrl: './fees.component.html',
  styleUrls: ['./fees.component.scss'],
  imports: [IonicModule, FormsModule, ReactiveFormsModule],
  providers: [CommonService, BackendService]
})
export class FeesComponent  implements OnInit {

  userId: number | string;
  form = new FormGroup({
    Fees: new FormControl('', Validators.required),
    FeesAmount: new FormControl('', Validators.required)
  });

  updateModal = {
    Fees: '',
    FeesAmount: ''
  };

  updateFeesId: number | string = '';

  tableData = [];
  tableDataCopy = [];

  constructor(private service: CommonService, private backend: BackendService, public navCtrl: NavController) { }

  ngOnInit() {}

  ionViewWillEnter() {
    let info: any = JSON.parse(localStorage.getItem('userInfo'));
    this.userId = info.UserId;
    this.loadTable();    
  }

  private loadTable() {
    this.backend.PostRequest('Fee/GetAllFees', { UserId: this.userId }).then(res => {
      if(res.isSuccessful) {
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
    if(this.form.invalid) {
      this.service.presentToast('Please enter valid credentials', 'warning-outline', 'danger');
    }
    else {
      this.subitForm();
    }
  }

  subitForm() {
    let data: any = this.form.value;
    data.UserId = this.userId;
    this.backend.PostRequest('Fee/InsertFees', data).then(res => {
      if(res.isSuccessful) {
        this.service.presentToast(res.message, 'checkmark-done', 'purple');
        this.form.reset();
        this.loadTable();
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

  setUpdateForm(id: number) {
    let f = this.tableData.find(item => {
      return item.FeesId == id;
    });
    this.updateFeesId = id;
    this.updateModal.Fees = f.Fees;
    this.updateModal.FeesAmount = f.FeesAmount;
  }

  update(FeesId: string | number) {
    if(this.updateModal.Fees.toString().trim() == '') {
      this.service.presentToast('Please Enter Fees', 'warning-outline', 'danger');
    }
    else if(this.updateModal.FeesAmount.toString().trim() == '') {
      this.service.presentToast('Please Enter Fees Amount', 'warning-outline', 'danger');
    }
    else {
      let data: any = this.updateModal;
      data.UserId = this.userId;
      data.FeesId = FeesId;
      this.backend.PostRequest('Fee/UpdateFees', data).then(res => {
        if(res.isSuccessful) {
          this.service.presentToast(res.message, 'checkmark-done', 'purple');
          this.cancleUpdate();
          this.loadTable();
        }
        else {
          this.service.presentToast(res.message, 'warning-outline', 'danger');
        }
      }).catch(() => {
        this.service.presentToast('Something went wrong', 'warning-outline', 'danger');
      });
    }
  }

  cancleUpdate() {
    this.updateFeesId = '';
    this.updateModal.Fees = '';
    this.updateModal.FeesAmount = '';
  }

}
