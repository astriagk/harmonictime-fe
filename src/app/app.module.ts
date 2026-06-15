import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { SharedModule } from './shared/shared.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ShopModule } from './shop/shop.module';
import { GenericService } from './shared/services/generic.service';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { UserEffects } from './store/effects/user.effects';
import { appReducer } from './store/app.reducer';
import { environment } from '@env/environment';
import { UserService } from '@shared/services/user.service';
import { CartEffects } from './store/effects/cart.effects';
import { OrdersEffects } from './store/effects/orders.effects';
import { WishlistEffects } from './store/effects/wishlist.effects';
import { GstEffects } from './store/effects/gst.effects';
import { ProductEffects } from './store/effects/product.effects';
import { FiltersEffects } from './store/effects/filters.effects';
import { SellerProductsEffects } from './store/effects/seller-products.effects';
import { SellerOrdersEffects } from './store/effects/seller-orders.effects';
import { AdminOffersEffects } from './store/effects/admin-offers.effects';
import { AddressesEffects } from './store/effects/addresses.effects';
import { WalletEffects } from './store/effects/wallet.effects';
import { WalletItemsEffects } from './store/effects/wallet-items.effects';
import { WithdrawalsEffects } from './store/effects/withdrawals.effects';
import { BankAccountsEffects } from './store/effects/bank-accounts.effects';
import { SellerOffersEffects } from './store/effects/seller-offers.effects';
import { AdminUsersEffects } from './store/effects/admin-users.effects';
import { AdminProductsEffects } from './store/effects/admin-products.effects';
import { AdminWithdrawalsEffects } from './store/effects/admin-withdrawals.effects';
import { TitleStrategy } from '@angular/router';
import { PageTitleStrategy } from './shared/strategies/page-title.strategy';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule,
    ShopModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      progressBar: false,
      enableHtml: true,
      positionClass: 'toast-top-center',
    }),
    StoreModule.forRoot(appReducer),
    EffectsModule.forRoot([
      UserEffects,
      CartEffects,
      OrdersEffects,
      WishlistEffects,
      GstEffects,
      ProductEffects,
      FiltersEffects,
      SellerProductsEffects,
      SellerOrdersEffects,
      AdminOffersEffects,
      AddressesEffects,
      WalletEffects,
      WalletItemsEffects,
      WithdrawalsEffects,
      BankAccountsEffects,
      SellerOffersEffects,
      AdminUsersEffects,
      AdminProductsEffects,
      AdminWithdrawalsEffects,
    ]),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production,
    }),
  ],
  providers: [
    GenericService,
    UserService,
    { provide: TitleStrategy, useClass: PageTitleStrategy },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
