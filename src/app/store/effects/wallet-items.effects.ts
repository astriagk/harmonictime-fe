import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { exhaustMap, map, catchError, filter, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  loadWalletItems,
  loadWalletItemsSuccess,
  loadWalletItemsFailure,
} from '../actions/wallet-items.actions';
import { selectWalletItemsState } from '../selectors/wallet-items.selectors';
import { GenericService } from '@shared/services/generic.service';
import { GET_WALLET_ITEMS } from '@config/index';

@Injectable()
export class WalletItemsEffects {
  loadWalletItems$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadWalletItems),
      withLatestFrom(this.store.select(selectWalletItemsState)),
      // Fetch when forced, not yet loaded, or the status filter changed.
      filter(
        ([action, state]) =>
          !!action.force || !state.loaded || action.status !== state.status
      ),
      exhaustMap(([{ status }]) => {
        const url = status
          ? `${GET_WALLET_ITEMS}?status=${status}`
          : GET_WALLET_ITEMS;
        return this.genericService.getObservableToken(url).pipe(
          map((res: any) =>
            loadWalletItemsSuccess({ items: res?.data ?? [], status })
          ),
          catchError((error) => of(loadWalletItemsFailure({ error })))
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
