/**
 * Title: user-management.component.ts
 * Author: Brock Hemsouvanh
 * Date: 07/24/2024
 * Updated: 07/25/2024 by Brock Hemsouvanh
 * Description: User management component for managing users
 */

'use strict';

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeService } from '../services/employee.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: User[] = []; // Array to store user data
  editUserForm: FormGroup;
  selectedUser: User | null = null;
  errorMessage: string = ''; // Initialize with an empty string
  successMessage: string = ''; // Initialize with an empty string

  constructor(private fb: FormBuilder, private employeeService: EmployeeService) {
    // Initialize the edit user form with validators
    this.editUserForm = this.fb.group({
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
      email: [null, [Validators.required, Validators.email]],
      role: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    console.log('UserManagementComponent initialized');
    this.loadUsers();
  }

  // Method to load all users from the API
  loadUsers(): void {
    this.employeeService.getAllUsers().subscribe(
      (data: User[]) => {
        this.users = data;
      },
      (error: any) => {
        console.error('Error fetching users:', error);
      }
    );
  }

  // Method to handle user editing
  editUser(user: User): void {
    this.selectedUser = user;
    this.editUserForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role
    });
    console.log('Edit user:', user);
  }

  // Method to save changes made to the user
  saveUserChanges(): void {
    if (this.editUserForm.valid && this.selectedUser) {
      const { firstName, lastName, email, role } = this.editUserForm.value;
      const updatedUser = {
        _id: this.selectedUser._id,
        firstName,
        lastName,
        email,
        role
      };
      // Call the service to update user profile
      this.employeeService.updateEmployeeProfile(updatedUser).subscribe(
        res => {
          this.successMessage = 'User updated successfully!'; // Handle success
          this.loadUsers(); // Refresh the user list to reflect changes
          console.log('User updated:', res);
        },
        err => {
          this.errorMessage = err.error.message || 'An error occurred while updating the user.'; // Handle error
          console.error('Error updating user:', err);
        }
      );
    }
  }

  // Method to handle user deletion
  deleteUser(userId: string): void {
    const confirmDelete = window.confirm('Are you sure you wish to delete this user?');
    if (confirmDelete) {
      this.employeeService.deleteUser(userId).subscribe(
        (response: any) => {
          console.log('User deleted:', response);
          this.loadUsers(); // Reload users after deletion
        },
        (error: any) => {
          console.error('Error deleting user:', error);
        }
      );
    }
  }

  // Method to reactivate a disabled user
  reactivateUser(user: User): void {
    user.isDisabled = false;
    this.employeeService.updateEmployeeProfile(user).subscribe(
      res => {
        this.successMessage = 'User reactivated successfully!'; // Handle success
        this.loadUsers(); // Refresh the user list to reflect changes
        console.log('User reactivated:', res);
      },
      err => {
        this.errorMessage = err.error.message || 'An error occurred while reactivating the user.'; // Handle error
        console.error('Error reactivating user:', err);
      }
    );
  }
}
