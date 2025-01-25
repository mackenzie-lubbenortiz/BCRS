/**
 * Title: role.guard.ts
 * Author: Brock Hemsouvanh
 * Date: 07/06/2024
 * Updated: 07/25/24 by Brock Hemsouvanh
 * 
 * This code was developed with reference to the Angular documentation on Injectables:
 * https://v17.angular.io/api/core/Injectable
 * 
 * Description: 
 * roleGuard service to protect routes based on user roles.
 */

'use strict';

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

/**
 * roleGuard service to protect routes based on user roles.
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const cookieService = inject(CookieService);
  const userRole = cookieService.get('role');
  
  console.log('roleGuard - Retrieved role from cookie:', userRole, 'for route:', route.routeConfig?.path); // Log the user role and route

  if (userRole) {
    console.log('roleGuard - User role is defined:', userRole);
    if (userRole === 'admin') {
      console.log('roleGuard: Access granted to route:', route.routeConfig?.path);
      return true; // Allow access to the route.
    } else {
      console.log('roleGuard: User role is not admin. Access denied.');
    }
  } else {
    console.log('roleGuard: No role found in cookies. Access denied.');
  }

  router.navigate(['/not-authorized']); // Navigate to 'not-authorized' page if the user is not an admin.
  return false; // Deny access to the route.
};
