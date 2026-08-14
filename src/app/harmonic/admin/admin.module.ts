import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';

import { AdminRoutingModule } from './admin-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { UsersComponent } from './users/users.component';
import { RolesComponent } from './roles/roles.component';
import { ApprovePaymentsComponent } from './approve-payments/approve-payments.component';
import { AdminOffersComponent } from './offers/offers.component';
import { AdminProductsComponent } from './products/products.component';
import { AdminBlogsComponent } from './blogs/list/list.component';
import { AdminBlogFormComponent } from './blogs/add-edit/add-edit.component';

@NgModule({
  declarations: [
    UsersComponent,
    RolesComponent,
    ApprovePaymentsComponent,
    AdminOffersComponent,
    AdminProductsComponent,
    AdminBlogsComponent,
    AdminBlogFormComponent,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    QuillModule.forRoot(),
  ],
})
export class AdminModule {}
