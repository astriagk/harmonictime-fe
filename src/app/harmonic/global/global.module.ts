import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GlobalRoutingModule } from './global-routing.module';
import { RecentlyViewedComponent } from './recently-viewed/recently-viewed.component';
import { ReviewsComponent } from './reviews/reviews.component';


@NgModule({
  declarations: [
    RecentlyViewedComponent,
    ReviewsComponent
  ],
  imports: [
    CommonModule,
    GlobalRoutingModule
  ]
})
export class GlobalModule { }
