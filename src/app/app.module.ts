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
