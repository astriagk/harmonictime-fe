import { ActionReducerMap } from '@ngrx/store';
import { AppState } from './app.state';
import { wishlistReducer } from './reducers/wishlist.reducer';
import { userReducer } from './reducers/user.reducer';
import { cartReducer } from './reducers/cart.reducer';
import { ordersReducer } from './reducers/orders.reducer';
import { gstReducer } from './reducers/gst.reducer';
import { productsReducer } from './reducers/product.reducer';
import { filtersReducer } from './reducers/filters.reducer';
import { sellerProductsReducer } from './reducers/seller-products.reducer';
import { sellerOrdersReducer } from './reducers/seller-orders.reducer';
import { adminOffersReducer } from './reducers/admin-offers.reducer';

export const appReducer: ActionReducerMap<AppState> = {
  user: userReducer,
  wishlist: wishlistReducer,
  cart: cartReducer,
  orders: ordersReducer,
  gst: gstReducer,
  products: productsReducer,
  filters: filtersReducer,
  sellerProducts: sellerProductsReducer,
  sellerOrders: sellerOrdersReducer,
  adminOffers: adminOffersReducer,
  // profile: profileReducer,
  // recentlyViewed: recentlyViewedReducer,
  // offers: offersReducer,
  // ui: uiReducer,
};
