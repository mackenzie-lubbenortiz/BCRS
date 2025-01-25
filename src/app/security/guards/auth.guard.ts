/**
 * Title: auth.guard.ts
 * Author: Mackenzie Lubben-Ortiz and Brock Hemsouvanh
 * Date: 7 July 2024
 * Updated: 19 July 2024 by Brock Hemsouvanh
 * Description: auth guard
 */
import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

export const authGuard: CanActivateFn = (route, state) => {
  const cookieService = inject(CookieService);
  const router = inject(Router);

  if (cookieService.get('session_user')) {
    return true;
  } else {
    router.navigate(['/signin'], { queryParams: { returnURL: state.url } });
    return false;
  }
};
