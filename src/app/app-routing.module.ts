/**
 * Title: app-routing.module.ts
 * Author: Professor Krasso and Brock Hemsouvanh
 * Date: 07/04/24
 * Updated: 07/25/2024 by Brock Hemsouvanh and Mackenzie Lubben-Ortiz
 */

'use strict';

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BaseLayoutComponent } from './layouts/base-layout/base-layout.component';
import { HomeComponent } from './home/home.component';
import { AdminComponent } from './admin/admin.component';
import { NotFoundPageComponent } from './not-found-page/not-found-page.component';
import { SigninComponent } from './signin/signin.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { RegisterComponent } from './security/register/register.component';
import { EmployeeDirectoryComponent } from './employee-directory/employee-directory.component';
import { FaqComponent } from './faq/faq.component';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { authGuard } from './auth.guard';
import { roleGuard } from './security/guards/role.guard';
import { ServiceRequestComponent } from './service-request/service-request.component';
import { InvoiceSummaryComponent } from './invoice-summary/invoice-summary.component';
import { PieComponent } from './pie/pie.component';
import { UserManagementComponent } from './user-management/user-management.component';

const routes: Routes = [
  {
    path: '',
    component: BaseLayoutComponent,
    children: [
      { path: '', component: HomeComponent, title: 'BCRS: Home' },
      { path: 'home', component: HomeComponent, data: { hideNavbar: true }, title: 'BCRS: Home' },
      { path: 'signin', component: SigninComponent, title: 'BCRS: Sign In' },
      { path: 'register', component: RegisterComponent, title: 'BCRS: Register' },
      { path: 'admin', component: AdminComponent, title: 'BCRS: Admin', canActivate: [authGuard, roleGuard] },
      { path: 'forgot-password', component: ForgotPasswordComponent, title: 'BCRS: Forgot Password' },
      { path: 'employee-directory', component: EmployeeDirectoryComponent, title: 'BCRS: Employee Directory', canActivate: [authGuard] },
      { path: 'faq', component: FaqComponent, title: 'BCRS: FAQ' },
      { path: 'my-profile', component: MyProfileComponent, title: 'BCRS: My Profile', canActivate: [authGuard] },
      { path: 'service-request', component: ServiceRequestComponent, title: 'BCRS: Service Request', canActivate: [authGuard] },
      { path: 'invoice-summary', component: InvoiceSummaryComponent, title: 'BCRS: Invoice Summary', canActivate: [authGuard] },
      { path: 'user-management', component: UserManagementComponent, title: 'BCRS: User Management', canActivate: [authGuard, roleGuard] },
      { path: 'service-history-graph', component: PieComponent, title: 'Service History'}
    ]
  },
  { path: '**', component: NotFoundPageComponent, title: 'BCRS: 404 Not Found' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { 
    useHash: true, 
    enableTracing: false, 
    scrollPositionRestoration: 'enabled' 
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
