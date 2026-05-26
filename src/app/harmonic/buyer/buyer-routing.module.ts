import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListComponent } from './products/list/list.component';
import { DetailsComponent } from './products/details/details.component';
import { CartComponent } from './cart/cart.component';
import { WishlistComponent } from './wishlist/wishlist.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { BuyerLayoutComponent } from 'src/app/shared/layout/buyer-layout/buyer-layout.component';
import { AccountComponent } from './account/account.component';
import { BuyerChatPageComponent } from './chat/buyer-chat-page.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'products',
    pathMatch: 'full',
  },
  {
    path: '',
    component: BuyerLayoutComponent,
    children: [
      {
        path: 'products',
        component: ListComponent,
        title: 'Products',
      },
      {
        path: 'product-details/:id',
        component: DetailsComponent,
        title: 'Product Details',
      },
      {
        path: 'cart',
        component: CartComponent,
        title: 'Cart',
      },
      {
        path: 'wishlist',
        component: WishlistComponent,
        title: 'Wishlist',
      },
      {
        path: 'checkout',
        component: CheckoutComponent,
        title: 'Checkout',
      },
      {
        path: 'account',
        component: AccountComponent,
        title: 'Account',
      },
      {
        path: 'chat',
        component: BuyerChatPageComponent,
        title: 'My Messages',
      },
    ],
  },
  { path: '**', redirectTo: 'products' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BuyerRoutingModule {}
