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
import { selectWishlistLoaded } from '../selectors/wishlist.selectors';
import { Store } from '@ngrx/store';

@Injectable()
export class WishlistEffects {
  loadWishlist$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadWishlist),
      withLatestFrom(
        this.store.select(selectUserData),
        this.store.select(selectWishlistLoaded)
      ),
      // Need a user, and skip a redundant fetch when already cached unless forced.
      filter(([action, userData, loaded]) =>
        !!userData?.user?.data && (!!action.force || !loaded)
      ),
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
    // Detect whether ProductID was populated (an object) or left as a raw id string.
    const populated =
      row?.ProductID && typeof row.ProductID === 'object'
        ? row.ProductID
        : row?.Product && typeof row.Product === 'object'
        ? row.Product
        : row?.product && typeof row.product === 'object'
        ? row.product
        : null;

    if (populated) {
      return {
        ...populated,
        _id: populated._id,         // product id — used for routerLink & add-to-cart
        ProductID: populated._id,   // for isProductInWishlist checks
        WishlistID: row._id,        // wishlist row id — used to remove the item
      };
    }

    // ProductID came back as a plain string id — use it directly so the
    // isProductInWishlist selector can still match by product id.
    const productId =
      typeof row?.ProductID === 'string' ? row.ProductID : row?._id;
    return {
      ...row,
      _id: productId,
      ProductID: productId,
      WishlistID: row?._id,
    };
  }

  constructor(
    private actions$: Actions,
    private genericService: GenericService,
    private store: Store
  ) {}
}
