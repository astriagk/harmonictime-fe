import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
import { SharedModule } from '../shared/shared.module';
import { ShopModule } from '../shop/shop.module';
import { HomeSevenComponent } from './home-seven/home-seven.component';

@NgModule({
  declarations: [HomeSevenComponent],
  imports: [CommonModule, HomeRoutingModule, SharedModule, ShopModule],
})
export class HomeModule {}
