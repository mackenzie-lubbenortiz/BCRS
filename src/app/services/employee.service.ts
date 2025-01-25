/**
 * Title: employee.service.ts
 * Author: Brock Hemsouvanh
 * Date: 07/18/2024
 * Updated: 07/28/2024 by Brock Hemsouvanh
 * Description: Service for handling employee-related API requests
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) { }

  /**
   * Method to get employee details by ID
   * @param id - The ID of the employee
   * @returns Observable<any> - The employee details
   */
  getEmployeeById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  /**
   * Method to update employee profile details
   * @param user - The user object with updated details
   * @returns Observable<any> - The response from the API
   */
  updateEmployeeProfile(user: User): Observable<any> {
    const { _id, ...updateData } = user; // Exclude _id from the update payload
    return this.http.put(`${this.apiUrl}/${_id}`, updateData);
  }

  /**
   * Method to get employee details by email
   * @param email - The email of the employee
   * @returns Observable<any> - The employee details
   */
  getEmployeeByEmail(email: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile/${email}`);
  }

  /**
   * Method to get all users
   * @returns Observable<any[]> - The array of users
   */
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  /**
   * Method to delete a user by ID
   * @param id - The ID of the user to delete
   * @returns Observable<any> - The response from the API
   */
  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
