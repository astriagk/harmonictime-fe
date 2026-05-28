import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { take, map } from 'rxjs/operators';
import { selectIsAccountRestricted } from 'src/app/store/selectors/user.selectors';
import { AppState } from 'src/app/store/app.state';

export const blockedGuard: CanActivateFn = () => {
  const store = inject(Store<AppState>);
  const router = inject(Router);

  return store.select(selectIsAccountRestricted).pipe(
    take(1),
    map(({ blocked, suspended }) => {
      if (blocked) {
        return router.createUrlTree(['/auth/account-blocked'], {
          queryParams: { reason: 'blocked' },
        });
      }
      if (suspended) {
        return router.createUrlTree(['/auth/account-blocked'], {
          queryParams: { reason: 'suspended' },
        });
      }
      return true;
    }),
  );
};
