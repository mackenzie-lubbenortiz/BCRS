/**
 * Title: my-profile.component.ts
 * Author: Professor Richard Krasso and Brock Hemsouvanh
 * Date: 07/18/2024
 * Updated: 07/28/2024 by Brock Hemsouvanh
 * Description: Component for managing the user's profile
 */

'use strict'; 

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeService } from '../services/employee.service';
import { CookieService } from 'ngx-cookie-service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css']
})
export class MyProfileComponent implements OnInit {
  profileForm: FormGroup;
  employee: User = {} as User;
  errorMessage: string = ''; // Initialize with an empty string
  successMessage: string = ''; // Initialize with an empty string

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private cookieService: CookieService
  ) {
    // Initialize the profile form with validators
    this.profileForm = this.fb.group({
      address: [null, Validators.required],
      phoneNumber: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    const sessionUser = this.cookieService.get('session_user'); // Get session user data from cookie
    console.log('sessionUser:', sessionUser); // Log the sessionUser cookie value

    if (sessionUser) {
      try {
        const user = JSON.parse(sessionUser);
        console.log('Parsed user:', user); // Log the parsed user object

        const userId = user._id; // Use _id from the parsed user object
        console.log('User ID:', userId); // Log the userId

        if (userId) {
          // Fetch the employee details by _id
          this.employeeService.getEmployeeById(userId).subscribe(
            data => {
              this.employee = data;
              console.log('Fetched employee data:', this.employee);
              // Populate the form with fetched employee data
              this.profileForm.patchValue({
                address: this.employee.address,
                phoneNumber: this.employee.phoneNumber
              });
            },
            err => {
              this.errorMessage = err.error.message; // Handle error
              console.error('Error fetching employee data:', err);
            }
          );
        } else {
          this.errorMessage = 'User ID is missing in the session user data.';
          console.error('User ID is missing in the session user data.');
        }
      } catch (e) {
        this.errorMessage = 'Failed to parse session user data.';
        console.error('Failed to parse session user data:', e);
      }
    } else {
      this.errorMessage = 'Session user cookie is missing.';
      console.error('Session user cookie is missing.');
    }
  }

  // Method to save changes made to the profile
  saveChanges(): void {
    if (this.profileForm.valid) {
      const { address, phoneNumber } = this.profileForm.value;
      const updatedUser: User = { ...this.employee, address, phoneNumber };
      // Call the service to update employee profile
      this.employeeService.updateEmployeeProfile(updatedUser).subscribe(
        res => {
          this.successMessage = 'Profile updated successfully!'; // Handle success
          // Optionally refresh the data to reflect changes immediately
          this.ngOnInit();
        },
        err => {
          this.errorMessage = err.error.message; // Handle error
          console.error('Error updating employee profile:', err);
        }
      );
    }
  }
}
