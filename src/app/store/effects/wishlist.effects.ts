import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, map, catchError, of, withLatestFrom, filter } from 'rxjs';
import {
  loadWishlist,
  loadWishlistFailure,
  loadWishlistSuccess,
} from '../actions/wishlist.actions';
import { GenericService } from '@shared/services/generic.service';
import { USER_WISHLIST } from '@config/index';
import { selectUserData } from '../selectors/user.selectors';
import { Store } from '@ngrx/store';

@Injectable()
export class WishlistEffects {
  loadWishlist$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadWishlist),
      withLatestFrom(this.store.select(selectUserData)), // Get user data from Store
      filter(([_, userData]) => !!userData?.user?.data), // Ensure user data exists
      switchMap(([_, userData]) => {
        const url = USER_WISHLIST + `${userData.user.data._id}`;
        return this.genericService.getObservable(url).pipe(
          map((response: any) =>
            loadWishlistSuccess({
              wishlist: (response.data || []).map((row: any) =>
                this.normalizeWishlistRow(row)
              ),
            })
          ),
          catchError((error) => of(loadWishlistFailure({ error })))
        );
      })
    )
  );

  // The wishlist endpoint returns rows that nest the product (populated under
  // ProductID) rather than flattening its fields like the cart does, so the
  // table rendered blank. Flatten the product onto the row so the template can
  // read ProductName/Price/Images and link to the product, while keeping the
  // wishlist row id (WishlistID) for removal (DELETE /wishlist/:id).
  private normalizeWishlistRow(row: any): any {
    const product =
      row?.ProductID && typeof row.ProductID === 'object'
        ? row.ProductID
        : row?.Product && typeof row.Product === 'object'
        ? row.Product
        : row?.product && typeof row.product === 'object'
        ? row.product
        : row;

    return {
      ...product, // ProductName, Price, Images, _id (product id), ...
      _id: product?._id ?? row?._id, // product id — used for routerLink & add-to-cart
      ProductID: product?._id ?? row?.ProductID, // for isProductInWishlist checks
      WishlistID: row?._id, // wishlist row id — used to remove the item
    };
  }

  constructor(
    private actions$: Actions,
    private genericService: GenericService,
    private store: Store
  ) {}
}
