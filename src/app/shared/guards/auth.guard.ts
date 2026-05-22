import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

/**
 * Blocks access to authenticated areas (e.g. seller pages) when no token is
 * present and redirects the visitor to the login page instead.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (token) {
    return true;
  }

  return router.createUrlTree(['/auth/login'], {
    queryParams: { returnUrl: state.url },
  });
};
