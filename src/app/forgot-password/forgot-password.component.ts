/**
 * Title: forgot-password.component.ts
 * Author: Brock Hemsouvanh
 * Date: 07/12/2024
 * Updated: 07/28/2024 by Brock Hemsouvanh
 * Description: Forgot Password Component for handling password reset requests
 */

import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  userId: string = ''; // Variable to hold the Employee ID input from the user
  successMessage: string = ''; // Variable to hold success message
  errorMessage: string = ''; // Variable to hold error message

  constructor(private http: HttpClient) {}

  // Method to handle form submission
  onSubmit() {
    const payload = { userId: this.userId };

    // Sending the password reset request to the backend API
    this.http.put(`http://localhost:3000/api/users/reset-password-by-id/${this.userId}`, payload)
      .subscribe(response => {
        console.log('Password has been reset.');
        this.successMessage = `Password has been reset to 'Password01' for Employee ID: ${this.userId}.`;
        this.errorMessage = ''; // Clear any previous error message
      }, error => {
        console.error('Error resetting password', error);
        this.errorMessage = 'Error resetting password. Please try again.';
        this.successMessage = ''; // Clear any previous success message
      });
  }
}
