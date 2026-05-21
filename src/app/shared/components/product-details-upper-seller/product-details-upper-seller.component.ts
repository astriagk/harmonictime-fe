import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IProduct, Product } from '../../types/product-d-t';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-details-upper-seller',
  templateUrl: './product-details-upper-seller.component.html',
  styleUrls: ['./product-details-upper-seller.component.scss'],
})
export class ProductDetailsUpperSellerComponent {
  @Input() product!: Product;
  @Input() bottomShow: boolean = true;
  @Input() style_2: boolean = false;
  @Output() itemDetails: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    public productService: ProductService,
    public cartService: CartService
  ) {}

  ngOnInit() {
    if (this.product) {
      this.productService.activeImg = this.product.Images[0].ImageURL;
    }
  }

  editProduct(item: any) {
    this.itemDetails.emit(item); // Set Page Number
  }
}
