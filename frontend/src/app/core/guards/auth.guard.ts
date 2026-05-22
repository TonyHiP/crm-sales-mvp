import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const sessionString = localStorage.getItem('crm_user_logged');

  if (sessionString) {
    try {
      const session = JSON.parse(sessionString);
      if (Number(session.rol_id) === 1) {
        return true;
      }
    } catch (e) {
      console.error('Error parseando sesion activa en guard:', e);
    }
  }

  router.navigate(['/panel/dashboard']);
  return false;
};
