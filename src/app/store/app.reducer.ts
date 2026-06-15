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
import { addressesReducer } from './reducers/addresses.reducer';
import { walletReducer } from './reducers/wallet.reducer';
import { walletItemsReducer } from './reducers/wallet-items.reducer';
import { withdrawalsReducer } from './reducers/withdrawals.reducer';
import { bankAccountsReducer } from './reducers/bank-accounts.reducer';
import { sellerOffersReducer } from './reducers/seller-offers.reducer';
import { adminUsersReducer } from './reducers/admin-users.reducer';
import { adminProductsReducer } from './reducers/admin-products.reducer';
import { adminWithdrawalsReducer } from './reducers/admin-withdrawals.reducer';

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
  addresses: addressesReducer,
  wallet: walletReducer,
  walletItems: walletItemsReducer,
  withdrawals: withdrawalsReducer,
  bankAccounts: bankAccountsReducer,
  sellerOffers: sellerOffersReducer,
  adminUsers: adminUsersReducer,
  adminProducts: adminProductsReducer,
  adminWithdrawals: adminWithdrawalsReducer,
  // profile: profileReducer,
  // recentlyViewed: recentlyViewedReducer,
  // offers: offersReducer,
  // ui: uiReducer,
};
