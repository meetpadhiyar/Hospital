import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.component').then((m) => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'fees',
    loadComponent: () => import('./fees/fees.component').then((m) => m.FeesComponent)
  },
  {
    path: 'patient',
    loadComponent: () => import('./patient/patient.component').then((m) => m.PatientComponent)
  },
  {
    path: 'patient-add',
    loadComponent: () => import('./patient-add/patient-add.component').then((m) => m.PatientAddComponent)
  },
  {
    path: 'hospital',
    loadComponent: () => import('./hospital/hospital.component').then((m) => m.HospitalComponent)
  },
  {
    path: 'medicines',
    loadComponent: () => import('./medicines/medicines.component').then((m) => m.MedicinesComponent)
  },
  {
    path: 'medicine-add',
    loadComponent: () => import('./medicine-add/medicine-add.component').then((m) => m.MedicineAddComponent)
  },
  {
    path: 'medicine/company',
    loadComponent: () => import('./medicine-company/medicine-company.component').then((m) => m.MedicineCompanyComponent)
  },
  {
    path: 'uom',
    loadComponent: () => import('./uom/uom.component').then((m) => m.UomComponent)
  },
  {
    path:'cure',
    loadComponent: () => import('./cure/cure.component').then((m) => m.CureComponent)
  },
  {
    path:'Dignosis',
    loadComponent: () => import('./dignosis/dignosis.component').then((m) => m.DignosisComponent)
  }
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
