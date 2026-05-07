import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

export const authGuard = () => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);

  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('token'); 
    if (token) return true;
  }

  router.navigate(['/login']);
  return false;
};

// BAGONG GUARD para sa Admin Only routes
export const adminGuard = () => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);

  if (isPlatformBrowser(platformId)) {
    const role = localStorage.getItem('userRole');
    if (role === 'admin') return true;
  }

  // Kung hindi admin, ibalik sa user-dashboard
  router.navigate(['/user-dashboard']);
  return false;
};