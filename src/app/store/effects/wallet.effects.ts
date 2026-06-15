import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { exhaustMap, map, catchError, filter, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  loadWallet,
  loadWalletSuccess,
  loadWalletFailure,
} from '../actions/wallet.actions';
import { selectWalletLoaded } from '../selectors/wallet.selectors';
import { GenericService } from '@shared/services/generic.service';
import { GET_WALLET } from '@config/index';

@Injectable()
export class WalletEffects {
  loadWallet$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadWallet),
      withLatestFrom(this.store.select(selectWalletLoaded)),
      filter(([action, loaded]) => !!action.force || !loaded),
      exhaustMap(() =>
        this.genericService.getObservableToken(GET_WALLET).pipe(
          map((res: any) => loadWalletSuccess({ wallet: res?.data ?? null })),
          catchError((error) => of(loadWalletFailure({ error })))
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
