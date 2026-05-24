import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AdminRoutingModule } from './admin-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { UsersComponent } from './users/users.component';
import { RolesComponent } from './roles/roles.component';
import { ApprovePaymentsComponent } from './approve-payments/approve-payments.component';
import { AdminOffersComponent } from './offers/offers.component';

@NgModule({
  declarations: [
    UsersComponent,
    RolesComponent,
    ApprovePaymentsComponent,
    AdminOffersComponent,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class AdminModule {}
