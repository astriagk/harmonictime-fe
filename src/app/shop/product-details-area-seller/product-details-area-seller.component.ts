import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { IProduct } from 'src/app/shared/types/product-d-t';

@Component({
  selector: 'app-product-details-area-seller',
  templateUrl: './product-details-area-seller.component.html',
  styleUrls: ['./product-details-area-seller.component.scss'],
})
export class ProductDetailsAreaSellerComponent {
  @Input() product: any;

  constructor(private router: Router) {}

  itemDetails(item: any) {
    this.router.navigate(['/seller/add-product' + `/${item._id}`]);
  }
}
