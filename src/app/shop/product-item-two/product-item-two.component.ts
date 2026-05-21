import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { CartService } from 'src/app/shared/services/cart.service';
import { UtilsService } from 'src/app/shared/services/utils.service';
import { IProduct } from 'src/app/shared/types/product-d-t';
import { isProductInCart } from 'src/app/store/selectors/cart.selectors';

@Component({
  selector: 'app-product-item-two',
  templateUrl: './product-item-two.component.html',
  styleUrls: ['./product-item-two.component.scss'],
})
export class ProductItemTwoComponent {
  @Input() product!: any; // IProduct;
  isProductInCart$ = (productId: string) =>
    this.store.select(isProductInCart(productId)); // Use selector for checking product

  constructor(
    public cartService: CartService,
    public utilsService: UtilsService,
    public store: Store
  ) {}

  // add to cart
  addToCart(item: IProduct) {
    this.cartService.addCartProduct(item);
  }
}
