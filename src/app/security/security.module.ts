/**
 * Title: security.module.ts
 * Author: Professor Krasso
 * Date: 8/5/23
 * Updated: 07/14/2024 by Brock Hemsouvanh
 */

// import statements
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SecurityRoutingModule } from './security-routing.module';
import { SecurityComponent } from './security.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RegisterComponent } from './register/register.component';
import { SigninComponent } from '../signin/signin.component';

@NgModule({
  declarations: [
    SecurityComponent, 
    SigninComponent, 
    RegisterComponent,
  ],
  imports: [
    CommonModule,
    SecurityRoutingModule,
    FormsModule,
    ReactiveFormsModule, 
    HttpClientModule,
    RouterModule,
  ]
})
export class SecurityModule { }
