import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { CartService } from 'src/app/shared/services/cart.service';
import { IProduct } from 'src/app/shared/types/product-d-t';
import { isProductInCart } from 'src/app/store/selectors/cart.selectors';

@Component({
  selector: 'app-product-sm-item',
  templateUrl: './product-sm-item.component.html',
  styleUrls: ['./product-sm-item.component.scss'],
})
export class ProductSmItemComponent {
  @Input() product!: any; // IProduct;
  isProductInCart$ = (productId: string) =>
    this.store.select(isProductInCart(productId)); // Use selector for checking product

  constructor(public cartService: CartService, public store: Store) {}

  // add to cart
  addToCart(item: IProduct) {
    this.cartService.addCartProduct(item);
  }
}
