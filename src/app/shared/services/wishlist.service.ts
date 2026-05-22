import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import {
  ADD_TO_WISHLIST,
  DELETE_WISHLIST_ITEM,
  USER_WISHLIST,
} from '@config/index';
import { GenericService } from './generic.service';
import {
  catchError,
  EMPTY,
  forkJoin,
  Observable,
  of,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { Store } from '@ngrx/store';
import { selectWishlistItems } from 'src/app/store/selectors/wishlist.selectors';
import {
  loadWishlist,
  updateWishlist,
} from 'src/app/store/actions/wishlist.actions';
import { selectUserData } from 'src/app/store/selectors/user.selectors';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  wishlist$: Observable<any[]> = this.store.select(selectWishlistItems);

  // Local mirror of the store so synchronous template helpers keep working
  private wishlistItems: any[] = [];

  constructor(
    private toastrService: ToastrService,
    private genericService: GenericService,
    private store: Store
  ) {
    this.wishlist$.subscribe((items) => (this.wishlistItems = items || []));
  }

  getWishlistProducts(): any[] {
    return this.wishlistItems;
  }

  // Toggle a product in the wishlist (heart icon behaviour)
  add_wishlist_product(payload: any) {
    this.store
      .select(selectUserData)
      .pipe(
        take(1),
        switchMap((state) => {
          const data = state?.user?.data; // Extract user data from store
          const existing = this.findExisting(payload._id);

          if (data) {
            if (existing) {
              // Already in wishlist -> remove it on the server (existing._id is the row id)
              const url = DELETE_WISHLIST_ITEM + `${existing._id}`;
              return this.genericService.deleteObservable(url).pipe(
                tap(() => {
                  this.toastrService.error(
                    `${payload.ProductName} removed from wishlist`
                  );
                  this.store.dispatch(loadWishlist());
                })
              );
            }
            const wishlistPayload = {
              UserID: data._id,
              ProductID: payload._id,
            };
            return this.genericService
              .postObservable(ADD_TO_WISHLIST, wishlistPayload)
              .pipe(
                tap(() => {
                  this.toastrService.success(
                    `${payload.ProductName} added to wishlist`
                  );
                  this.store.dispatch(loadWishlist());
                })
              );
          } else {
            // Guest user: keep the wishlist in session storage instead of forcing login
            this.toggleGuestWishlistProduct(payload);
            return EMPTY;
          }
        })
      )
      .subscribe({
        error: (err) => {
          const message =
            err?.error?.message || 'Something went wrong. Please try again.';
          this.toastrService.error(message);
        },
      });
  }

  // Remove a product from the wishlist (used on the wishlist page)
  removeWishlist(payload: any) {
    this.store
      .select(selectUserData)
      .pipe(take(1))
      .subscribe((state: any) => {
        const user = state?.user?.data;
        if (user) {
          // Logged-in user: delete the wishlist row on the server (payload._id is the row id)
          if (payload._id) {
            const url = DELETE_WISHLIST_ITEM + `${payload._id}`;
            this.genericService.deleteObservable(url).subscribe({
              next: () => {
                this.toastrService.error(
                  `${payload.ProductName} removed from wishlist`
                );
                this.store.dispatch(loadWishlist());
              },
              error: () => {
                this.toastrService.error(
                  `${payload.ProductName} error removing from wishlist`
                );
              },
            });
          }
        } else {
          // Guest user: remove from the session-storage wishlist
          this.removeGuestWishlistProduct(payload);
        }
      });
  }

  private findExisting(productId: string) {
    return this.wishlistItems.find(
      (p: any) => p.ProductID === productId || p._id === productId
    );
  }

  // ----- Guest wishlist (session storage) -----
  private readonly GUEST_WISHLIST_KEY = 'guest_wishlist';

  private getGuestWishlist(): any[] {
    return JSON.parse(sessionStorage.getItem(this.GUEST_WISHLIST_KEY) || '[]');
  }

  private saveGuestWishlist(wishlist: any[]) {
    sessionStorage.setItem(
      this.GUEST_WISHLIST_KEY,
      JSON.stringify(wishlist)
    );
    this.store.dispatch(updateWishlist({ wishlist }));
  }

  // Hydrate the store from session storage on app start (guest users)
  loadGuestWishlist() {
    this.store.dispatch(updateWishlist({ wishlist: this.getGuestWishlist() }));
  }

  private toggleGuestWishlistProduct(payload: any) {
    const guestWishlist = this.getGuestWishlist();
    const exists = guestWishlist.some((p: any) => p.ProductID === payload._id);
    if (exists) {
      this.removeGuestWishlistProduct(payload);
      return;
    }
    // Keep ProductID so isProductInWishlist() and the merge-on-login flow work
    const item = { ...payload, ProductID: payload._id };
    this.saveGuestWishlist([...guestWishlist, item]);
    this.toastrService.success(`${payload.ProductName} added to wishlist`);
  }

  private removeGuestWishlistProduct(payload: any) {
    const guestWishlist = this.getGuestWishlist().filter(
      (p: any) => p.ProductID !== payload._id && p._id !== payload._id
    );
    this.saveGuestWishlist(guestWishlist);
    this.toastrService.error(`${payload.ProductName} removed from wishlist`);
  }

  // On login, push any guest wishlist items to the server, clear session, reload wishlist
  mergeGuestWishlist(userId: string) {
    const guestWishlist = this.getGuestWishlist();
    if (!guestWishlist.length) {
      this.store.dispatch(loadWishlist());
      return;
    }
    const requests = guestWishlist.map((item: any) =>
      this.genericService
        .postObservable(ADD_TO_WISHLIST, {
          UserID: userId,
          ProductID: item.ProductID || item._id,
        })
        .pipe(catchError(() => of(null)))
    );
    forkJoin(requests).subscribe(() => {
      sessionStorage.removeItem(this.GUEST_WISHLIST_KEY);
      this.store.dispatch(loadWishlist());
    });
  }
}
