/**
 * Title: auth.service.ts
 * Author: Brock Hemsouvanh
 * Date: 07/19/2024
 * Updated: 07/25/2024 by Brock Hemsouvanh
 * Description: Service for handling authorization and authentication API requests
 */

'use strict';

import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject: BehaviorSubject<boolean>;
  private userSubject: BehaviorSubject<{ fullName: string } | null>;

  constructor(private cookieService: CookieService) {
    this.isLoggedInSubject = new BehaviorSubject<boolean>(this.cookieService.check('session_user'));
    const sessionUser = this.cookieService.get('session_user');
    const user = sessionUser ? JSON.parse(sessionUser) : null;
    this.userSubject = new BehaviorSubject<{ fullName: string } | null>(
      user ? { fullName: `${user.firstName} ${user.lastName}` } : null
    );
  }

  isLoggedIn(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }

  getUser(): Observable<{ fullName: string } | null> {
    return this.userSubject.asObservable();
  }

  loginUser(user: any): void {
    const sessionCookie = {
      _id: user._id,
      userId: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    };
    this.cookieService.set('session_user', JSON.stringify(sessionCookie), 1);
    this.cookieService.set('role', user.role, 1); // Added this line to set the role separately
    this.isLoggedInSubject.next(true);
    this.userSubject.next({ fullName: `${user.firstName} ${user.lastName}` });

    console.log('User logged in: userId:', sessionCookie.userId, 'role:', sessionCookie.role); // Minimized logging
    console.log('Updated isLoggedInSubject:', this.isLoggedInSubject.value);
    console.log('Updated userSubject:', this.userSubject.value);
  }


  logoutUser(): void {
    this.cookieService.deleteAll();
    this.isLoggedInSubject.next(false);
    this.userSubject.next(null);

    console.log('User logged out');
    console.log('Updated isLoggedInSubject:', this.isLoggedInSubject.value);
    console.log('Updated userSubject:', this.userSubject.value);
  }
}
