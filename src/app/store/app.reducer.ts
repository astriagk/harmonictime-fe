import { ActionReducerMap } from '@ngrx/store';
import { AppState } from './app.state';
import { wishlistReducer } from './reducers/wishlist.reducer';
import { userReducer } from './reducers/user.reducer';
import { cartReducer } from './reducers/cart.reducer';
import { ordersReducer } from './reducers/orders.reducer';

export const appReducer: ActionReducerMap<AppState> = {
  user: userReducer,
  wishlist: wishlistReducer,
  cart: cartReducer,
  orders: ordersReducer,
  // profile: profileReducer,
  // recentlyViewed: recentlyViewedReducer,
  // offers: offersReducer,
  // ui: uiReducer,
};
