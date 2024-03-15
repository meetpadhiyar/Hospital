import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { CommonService } from '../services/common.service';
import { BackendService } from '../services/backend.service';
import { DatePipe } from '@angular/common';
import Chart from 'chart.js/auto';

@Component({
  standalone: true,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [IonicModule, DatePipe],
  providers: [CommonService, BackendService, DatePipe]
})
export class HomeComponent implements OnInit {

  @ViewChild('chartCanvas') chartCanvas: ElementRef;

  userInfo: any = {};
  widgets: any = [];
  patientChart: any = [];
  patientGrid: any = [];

  constructor(private router: Router, private service: CommonService, private backend: BackendService) { }

  ngOnInit() { }

  ionViewDidEnter() {
    // 7359192973
    // UserId
    // UserType
    // Company
    // UserName
    // FullName
    // CompanyId
    let userInfo: any = localStorage.getItem('userInfo');
    this.userInfo = JSON.parse(userInfo);
    this.backend.PostRequest('ShowDashBoard/ShowDashBoard', {}).then(res => {
      if (res.isSuccessful) {
        this.widgets = res.data.Widgets;
        this.patientChart = res.data.PatientChart;
        this.patientGrid = res.data.PatientGrid;
        this.createChart();
      }
      else {
        this.service.presentToast(res.message, 'warning-outline', 'danger');
      }
    }).catch(() => {
      this.service.presentToast('Something went wrong', 'warning-outline', 'danger');
    });
  }

  changeRoute(route: string) {
    this.router.navigateByUrl(route);
  }

  createChart() {
    const ctx = this.chartCanvas.nativeElement.getContext('2d');

    // Extracting data
    const dates = this.patientChart.map(item => item.Date);
    const patientCounts = this.patientChart.map(item => item.cntPaitentId);

    // Configuring chart data
    const chartData = {
      labels: dates,
      datasets: [{
        label: 'Number of Patients',
        data: patientCounts,
        backgroundColor: 'rgba(54, 162, 235, 0.5)', // Blue
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    };

    // Creating chart instance
    new Chart(ctx, {
      type: 'bar',
      data: chartData,
      options: {
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Patients'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Date'
            }
          }
        }
      }
    });
  }


}
