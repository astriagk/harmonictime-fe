import { UserState } from './reducers/user.reducer';
import { WishlistState } from './reducers/wishlist.reducer';
import { GstState } from './reducers/gst.reducer';
import { ProductsState } from './reducers/product.reducer';
import { FiltersState } from './reducers/filters.reducer';
import { SellerProductsState } from './reducers/seller-products.reducer';
import { SellerOrdersState } from './reducers/seller-orders.reducer';
import { AdminOffersState } from './reducers/admin-offers.reducer';

export interface AppState {
  user: UserState;
  wishlist: WishlistState;
  cart: any;
  orders: any;
  gst: GstState;
  products: ProductsState;
  filters: FiltersState;
  sellerProducts: SellerProductsState;
  sellerOrders: SellerOrdersState;
  adminOffers: AdminOffersState;
  // profile: ProfileState;
  // recentlyViewed: RecentlyViewedState;
  // offers: OfferState;
  // ui: UIState;
}
