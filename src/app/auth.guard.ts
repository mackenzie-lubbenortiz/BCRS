/**
 * Title: auth.guard.ts
 * Author: Mackenzie Lubben-Ortiz
 * Date: 7 July 2024
 * Description: auth guard
 */
import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

export const authGuard: CanActivateFn = (route, state) => {
  const cookie = inject(CookieService);

  if (cookie.get('session_user')) {
    return true;
  } else {
    const router = inject(Router);
    router.navigate(["/"]), {queryParams: {returnURL: state.url}}
    return false;
  }
}