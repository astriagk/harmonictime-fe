import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { exhaustMap, map, catchError, filter, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  loadWithdrawals,
  loadWithdrawalsSuccess,
  loadWithdrawalsFailure,
} from '../actions/withdrawals.actions';
import { selectWithdrawalsLoaded } from '../selectors/withdrawals.selectors';
import { GenericService } from '@shared/services/generic.service';
import { WITHDRAWALS } from '@config/index';

@Injectable()
export class WithdrawalsEffects {
  loadWithdrawals$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadWithdrawals),
      withLatestFrom(this.store.select(selectWithdrawalsLoaded)),
      filter(([action, loaded]) => !!action.force || !loaded),
      exhaustMap(() =>
        this.genericService.getObservableToken(WITHDRAWALS).pipe(
          map((res: any) =>
            loadWithdrawalsSuccess({ withdrawals: res?.data ?? [] })
          ),
          catchError((error) => of(loadWithdrawalsFailure({ error })))
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
