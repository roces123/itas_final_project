import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  // Kunin ang user role mula sa localStorage (na sine-set natin tuwing login)
  const userRole = localStorage.getItem('userRole'); 

  if (userRole === 'admin') {
    return true;
  } else {
    // Kung hindi admin, i-redirect sa unauthorized page o dashboard ng student
    alert('Access Denied: Admins Only!');
    router.navigate(['/my-request']);
    return false;
  }
};