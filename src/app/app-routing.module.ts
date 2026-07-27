import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { authGuard } from './shared/guards/auth.guard';
import { blockedGuard } from './shared/guards/blocked.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'buyer',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./harmonic/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then((m) => m.HomeModule),
  },
  {
    path: 'shop',
    loadChildren: () => import('./shop/shop.module').then((m) => m.ShopModule),
  },
  {
    path: 'pages',
    loadChildren: () =>
      import('./pages/pages.module').then((m) => m.PagesModule),
  },
  {
    path: 'seller',
    canActivate: [authGuard, blockedGuard],
    loadChildren: () =>
      import('./harmonic/seller/seller.module').then((m) => m.SellerModule),
  },
  {
    path: 'buyer',
    canActivate: [blockedGuard],
    loadChildren: () =>
      import('./harmonic/buyer/buyer.module').then((m) => m.BuyerModule),
  },
  {
    path: 'admin',
    canActivate: [blockedGuard],
    loadChildren: () =>
      import('./harmonic/admin/admin.module').then((m) => m.AdminModule),
  },
  // Internal, unlisted tool — reached only by typing the URL. Not in any menu.
  {
    path: 'generate-invoice',
    loadComponent: () =>
      import(
        './harmonic/tools/generate-invoice/generate-invoice.component'
      ).then((m) => m.GenerateInvoiceComponent),
    title: 'Generate Invoice',
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: false,
      anchorScrolling: 'enabled',
      scrollPositionRestoration: 'enabled',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
