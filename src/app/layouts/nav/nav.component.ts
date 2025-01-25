/**
 * Title: nav.component.ts
 * Author: Professor Krasso and Brock Hemsouvanh
 * Date: 8/5/23
 * Updated: 07/21/2024 by Brock Hemsouvanh
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

export interface AppUser {
  fullName: string;
  role: string;
}

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit, OnDestroy {
  appUser: AppUser | null = null;
  isSignedIn: boolean = false;
  isAdmin: boolean = false;
  private authSubscription: Subscription | undefined;

  constructor(private cookieService: CookieService, private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.authSubscription = this.authService.isLoggedIn().subscribe((loggedIn) => {
      this.isSignedIn = loggedIn;
      this.setUserDetails();
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  setUserDetails(): void {
    if (this.isSignedIn) {
      const sessionUser = this.cookieService.get('session_user');
      if (sessionUser) {
        const user = JSON.parse(sessionUser);
        this.appUser = { fullName: user.firstName + ' ' + user.lastName, role: user.role };
        this.isAdmin = user.role === 'admin';
        console.log('Signed in as', this.appUser.fullName, 'with role', this.appUser.role); // Log the user details and role
  
        if (this.isAdmin) {
        } else {
        }
      } else {
        console.log('No session user found in cookies.');
      }
    } else {
      this.appUser = null;
      this.isAdmin = false;
      console.log('User is not signed in.');
    }
  }
  

  signout(): void {
    console.log('Clearing cookies');
    this.authService.logoutUser(); // Use AuthService to log out the user
    this.isSignedIn = false;
    this.isAdmin = false;
    this.appUser = null;
    this.router.navigate(['/']);
  }

  logDropdownToggle(): void {
  }
}
