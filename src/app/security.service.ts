import { Injectable } from '@angular/core';
import { HttpClient } from  '@angular/common/http';
import { Observable} from 'rxjs';
import { RegisterViewModel } from './security/register/register-view-model';


@Injectable({
  providedIn: 'root'
})
export class SecurityService {

  constructor(private http: HttpClient) {}

  /** 
   * Descriptions: This function returns the user by userId from the database
   * @param userId
   * @returns user
  */

  // findById API call
  findUserById(userId: number) {
    return this.http.get(`/api/users/${userId}`);
  }

 /** 
  * Descriptions: This function returns the user by userId from the database
  * @param email
  * @returns password
  * @returns
 */

// Signin API call
  signin(email: string, password: string) {
    return this.http.post('/api/security/signin', {
      email: email, password: password
    });
  }
  
  //Register API call
  register(user: any): Observable<any> {
    return this.http.post('/api/security/register', user);
  }

/**
 * @description This function returns the verifyEmail function
 * @param email 
 * @returns Observation of type  any
 */

 verifyEmail(email: string) {
  return this.http.post('api/security/verify/users' + email, { }) // returns the verify function
 }

}