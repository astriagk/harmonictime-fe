import { Component, Input } from '@angular/core';
import { IProduct, Product } from '../../types/product-d-t';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-details-upper',
  templateUrl: './product-details-upper.component.html',
  styleUrls: ['./product-details-upper.component.scss'],
})
export class ProductDetailsUpperComponent {
  @Input() product!: any;
  @Input() bottomShow: boolean = true;
  @Input() style_2: boolean = false;

  constructor(
    public productService: ProductService,
    public cartService: CartService
  ) {}

  ngOnInit() {
    if (this.product) {
      this.productService.activeImg = this.product?.Images?.[0]?.ImageURL;
    }
  }
}
