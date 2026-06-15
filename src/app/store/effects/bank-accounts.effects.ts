import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { exhaustMap, map, catchError, filter, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  loadBankAccounts,
  loadBankAccountsSuccess,
  loadBankAccountsFailure,
} from '../actions/bank-accounts.actions';
import { selectBankAccountsLoaded } from '../selectors/bank-accounts.selectors';
import { GenericService } from '@shared/services/generic.service';
import { BANK_ACCOUNTS } from '@config/index';

@Injectable()
export class BankAccountsEffects {
  loadBankAccounts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadBankAccounts),
      withLatestFrom(this.store.select(selectBankAccountsLoaded)),
      filter(([action, loaded]) => !!action.force || !loaded),
      exhaustMap(() =>
        this.genericService.getObservableToken(BANK_ACCOUNTS).pipe(
          map((res: any) =>
            loadBankAccountsSuccess({ bankAccounts: res?.data ?? [] })
          ),
          catchError((error) => of(loadBankAccountsFailure({ error })))
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
