import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SellerRoutingModule } from './seller-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ListComponent } from './products/list/list.component';
import { AddEditComponent } from './products/add-edit/add-edit.component';
import { DetailsComponent } from './products/details/details.component';
import { OrdersComponent } from './orders/orders.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { ShopModule } from 'src/app/shop/shop.module';
import { MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
  declarations: [
    DashboardComponent,
    ListComponent,
    AddEditComponent,
    DetailsComponent,
    OrdersComponent,
    AnalyticsComponent,
  ],
  imports: [
    CommonModule,
    SellerRoutingModule,
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
export class SellerModule {}
