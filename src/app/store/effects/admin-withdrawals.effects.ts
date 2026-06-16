import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { exhaustMap, map, catchError, filter, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  loadAdminWithdrawals,
  loadAdminWithdrawalsSuccess,
  loadAdminWithdrawalsFailure,
} from '../actions/admin-withdrawals.actions';
import { selectAdminWithdrawalsState } from '../selectors/admin-withdrawals.selectors';
import { GenericService } from '@shared/services/generic.service';
import { ADMIN_WITHDRAWALS } from '@config/index';

@Injectable()
export class AdminWithdrawalsEffects {
  loadAdminWithdrawals$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadAdminWithdrawals),
      withLatestFrom(this.store.select(selectAdminWithdrawalsState)),
      filter(
        ([action, state]) =>
          !!action.force || !state.loaded || action.status !== state.status
      ),
      exhaustMap(([{ status }]) => {
        const url =
          status === 'All'
            ? ADMIN_WITHDRAWALS
            : `${ADMIN_WITHDRAWALS}?status=${status}`;
        return this.genericService.getObservableToken(url).pipe(
          map((res: any) =>
            loadAdminWithdrawalsSuccess({ withdrawals: res?.data ?? [], status })
          ),
          catchError((error) => of(loadAdminWithdrawalsFailure({ error })))
        );
      })
    )
  );

  constructor(
    private actions$: Actions,
    private store: Store,
    private genericService: GenericService
  ) {}
}
