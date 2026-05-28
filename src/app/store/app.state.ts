import { UserState } from './reducers/user.reducer';
import { WishlistState } from './reducers/wishlist.reducer';
import { GstState } from './reducers/gst.reducer';

export interface AppState {
  user: UserState;
  wishlist: WishlistState;
  cart: any;
  orders: any;
  gst: GstState;
  // profile: ProfileState;
  // recentlyViewed: RecentlyViewedState;
  // offers: OfferState;
  // ui: UIState;
}
