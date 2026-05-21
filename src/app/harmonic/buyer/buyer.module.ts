import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BuyerRoutingModule } from './buyer-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ListComponent } from './products/list/list.component';
import { DetailsComponent } from './products/details/details.component';
import { CartComponent } from './cart/cart.component';
import { WishlistComponent } from './wishlist/wishlist.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { OrdersComponent } from './orders/orders.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { SharedModule } from 'src/app/shared/shared.module';
import { ShopModule } from 'src/app/shop/shop.module';
import { AccountComponent } from './account/account.component';

@NgModule({
  declarations: [
    DashboardComponent,
    ListComponent,
    DetailsComponent,
    CartComponent,
    WishlistComponent,
    CheckoutComponent,
    OrdersComponent,
    AccountComponent,
  ],
  imports: [
    CommonModule,
    BuyerRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    ShopModule,
    MatStepperModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
  ],
})
export class BuyerModule {}
