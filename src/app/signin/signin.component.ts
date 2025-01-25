/**
 * Title: signin.component.ts
 * Author: Brock Hemsouvanh
 * Date: 07/07/2024
 * Updated: 07/21/2024 by Brock Hemsouvanh
 * Description: Component for handling user sign-in
 */

import { Component } from '@angular/core';
import { SecurityService } from 'src/app/security.service';
import { CookieService } from 'ngx-cookie-service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})

export class SigninComponent {
  errMessage: string = '';
  isLoading: boolean = false;
  fieldTextType: boolean = false; 
  signinForm: FormGroup;

  constructor(
    private fb: FormBuilder, 
    private router: Router, 
    private cookieService: CookieService, 
    private secService: SecurityService, 
    private route: ActivatedRoute,
    private authService: AuthService // Inject AuthService
  ) {
    this.signinForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)]]
    });
    this.errMessage = '';
  }

  signIn(): void {
    if (this.signinForm.valid) {
      this.isLoading = true;
  
      const { email, password } = this.signinForm.value;
  
      if (!email) {
        this.errMessage = 'Please provide your email address';
        this.isLoading = false;
        return;
      }
      if (!password) {
        this.errMessage = 'Please provide your password';
        this.isLoading = false;
        return;
      }
      
      this.secService.signin(email, password).subscribe({
        next: (user: any) => {
          this.authService.loginUser(user); // Use AuthService to log in the user
          this.router.navigate(['/service-request']);
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          // General error message for authentication failure
          if (err.status === 401 || err.status === 404) { // Typically 401 for unauthorized
            this.errMessage = 'Invalid email or password. Please try again.';
          } else {
            this.errMessage = 'Something went wrong. Please try again later.';
            console.error('Error during sign in:', err);
          }
        }
      });
    }
  }
  

  toggleFieldTextType(): void {
    this.fieldTextType = !this.fieldTextType;
  }
}
