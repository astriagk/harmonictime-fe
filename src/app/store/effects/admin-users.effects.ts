import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { exhaustMap, map, catchError, filter, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  loadAdminUsers,
  loadAdminUsersSuccess,
  loadAdminUsersFailure,
} from '../actions/admin-users.actions';
import { selectAdminUsersLoaded } from '../selectors/admin-users.selectors';
import { GenericService } from '@shared/services/generic.service';
import { ADMIN_USERS } from '@config/index';

@Injectable()
export class AdminUsersEffects {
  loadAdminUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadAdminUsers),
      withLatestFrom(this.store.select(selectAdminUsersLoaded)),
      filter(([action, loaded]) => !!action.force || !loaded),
      exhaustMap(() =>
        this.genericService.getObservableToken(ADMIN_USERS).pipe(
          map((res: any) => loadAdminUsersSuccess({ users: res?.data ?? [] })),
          catchError((error) => of(loadAdminUsersFailure({ error })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private store: Store,
    private genericService: GenericService
  ) {}
}
