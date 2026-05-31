import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { CartService } from 'src/app/shared/services/cart.service';
import { CompareService } from 'src/app/shared/services/compare.service';
import { UtilsService } from 'src/app/shared/services/utils.service';
import { WishlistService } from 'src/app/shared/services/wishlist.service';
import { IProduct } from 'src/app/shared/types/product-d-t';
import { isProductInCart } from 'src/app/store/selectors/cart.selectors';
import { isProductInWishlist } from 'src/app/store/selectors/wishlist.selectors';

@Component({
  selector: 'app-product-list-item',
  templateUrl: './product-list-item.component.html',
  styleUrls: ['./product-list-item.component.scss'],
})
export class ProductListItemComponent implements OnChanges {
  @Input() product!: any; //  IProduct;

  inCart$!: Observable<boolean>;
  inWishlist$!: Observable<boolean>;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] && this.product?._id) {
      this.inCart$ = this.store.select(isProductInCart(this.product._id));
      this.inWishlist$ = this.store.select(isProductInWishlist(this.product._id));
    }
  }

  isProductInCart$ = (productId: string) =>
    this.store.select(isProductInCart(productId));
  isProductInWishlist$ = (productId: string) =>
    this.store.select(isProductInWishlist(productId));

  constructor(
    public cartService: CartService,
    public wishlistService: WishlistService,
    public compareService: CompareService,
    public utilsService: UtilsService,
    public store: Store,
  ) {}

  // add to cart
  addToCart(item: any) {
    this.cartService.addCartProduct(item);
  }

  // add to cart
  addToWishlist(product: any) {
    this.wishlistService.add_wishlist_product(product);
  }

  // add to cart
  addToCompare(product: IProduct) {
    this.compareService.add_compare_product(product);
  }

  isItemInWishlist(item: any): boolean {
    return this.wishlistService
      .getWishlistProducts()
      .some((prd: any) => prd.ProductID === item._id || prd._id === item._id);
  }

  isItemInCompare(item: IProduct): boolean {
    return this.compareService
      .getCompareProducts()
      .some((prd: IProduct) => prd.id === item.id);
  }
}
