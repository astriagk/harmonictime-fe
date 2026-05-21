import { UserState } from './reducers/user.reducer';
import { WishlistState } from './reducers/wishlist.reducer';

export interface AppState {
  user: UserState;
  wishlist: WishlistState;
  cart: any;
  orders: any;
  // profile: ProfileState;
  // recentlyViewed: RecentlyViewedState;
  // offers: OfferState;
  // ui: UIState;
}
