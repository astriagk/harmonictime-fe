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

// Note: these routes carry no `title` property. The document title is set from
// `data.seo` by SeoService (via AppComponent) so that the title, description,
// canonical and OG tags are always written together by one owner — Angular's
// TitleStrategy would otherwise race it and win on some navigations.
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
        data: {
          seo: {
            title: 'Shop Pre-Owned & Vintage Luxury Watches',
            description:
              'Browse authenticated pre-owned and vintage watches on Krono2 — Rolex, Omega, Seiko and more, from verified sellers with secure payments.',
          },
        },
      },
      {
        // Title and description are built from the loaded product, so the
        // component owns the head here — see DetailsComponent.
        path: 'product-details/:id',
        component: DetailsComponent,
        data: { seo: { managedByComponent: true } },
      },
      // Everything below is signed-in or transactional: kept out of the index
      // to match the Disallow rules in robots.txt.
      {
        path: 'cart',
        component: CartComponent,
        data: { seo: { title: 'Your Cart', noIndex: true } },
      },
      {
        path: 'wishlist',
        component: WishlistComponent,
        data: { seo: { title: 'Your Wishlist', noIndex: true } },
      },
      {
        path: 'checkout',
        component: CheckoutComponent,
        data: { seo: { title: 'Checkout', noIndex: true } },
      },
      {
        path: 'account',
        component: AccountComponent,
        data: { seo: { title: 'Your Account', noIndex: true } },
      },
      {
        path: 'chat',
        component: BuyerChatPageComponent,
        data: { seo: { title: 'Messages', noIndex: true } },
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
