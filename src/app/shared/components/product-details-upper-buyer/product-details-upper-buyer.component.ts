import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Product } from '../../types/product-d-t';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { GenericService } from '../../services/generic.service';
import { Store } from '@ngrx/store';
import { selectCartItems } from 'src/app/store/selectors/cart.selectors';
import { selectUserData } from 'src/app/store/selectors/user.selectors';
import { isProductInWishlist } from 'src/app/store/selectors/wishlist.selectors';
import { ReviewFormComponent } from '../forms/review-form/review-form.component';
import {
  getPrimaryImageUrl,
  sortImagesPrimaryFirst,
} from '../../utils/product-images';
import { USER_CART_ITEM } from '@config/index';

@Component({
  selector: 'app-product-details-upper-buyer',
  templateUrl: './product-details-upper-buyer.component.html',
  styleUrls: ['./product-details-upper-buyer.component.scss'],
})
export class ProductDetailsUpperBuyerComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @Input() product!: any; //  Product;
  @Input() bottomShow: boolean = true;
  @Input() style_2: boolean = false;
  @Input() reviewCount: number = 0;
  @Input() averageRating: number = 0;
  @Output() itemDetails: EventEmitter<any> = new EventEmitter<any>();
  @Output() reviewSubmitted: EventEmitter<void> = new EventEmitter<void>();
  cartItems: any = [];
  stars = [1, 2, 3, 4, 5];
  isInCart = false;
  userId: string | null = null;
  inWishlist$!: Observable<boolean>;
  quantity = 1;
  maxQty = 1;

  @ViewChild('reviewModal') reviewModalRef?: ElementRef<HTMLElement>;
  @ViewChild(ReviewFormComponent) reviewFormCmp?: ReviewFormComponent;

  constructor(
    public productService: ProductService,
    public cartService: CartService,
    public wishlistService: WishlistService,
    public store: Store,
    private genericService: GenericService,
    private router: Router,
  ) {}

  // Reset the review form whenever the modal is closed
  private onModalHidden = () => this.reviewFormCmp?.resetForm();

  ngAfterViewInit(): void {
    this.reviewModalRef?.nativeElement.addEventListener(
      'hidden.bs.modal',
      this.onModalHidden,
    );
  }

  ngOnDestroy(): void {
    this.reviewModalRef?.nativeElement.removeEventListener(
      'hidden.bs.modal',
      this.onModalHidden,
    );
  }

  ngOnInit() {
    this.store.select(selectCartItems).subscribe((state) => {
      this.cartItems = state?.length ? state : [];
    });
    this.store.select(selectUserData).subscribe((state) => {
      this.userId = state?.user?.data?._id ?? null;
      this.checkCartStatus();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.product) {
      this.productService.activeImg = getPrimaryImageUrl(this.product.Images);
      this.productService.activeIsVideo = false;
      this.checkCartStatus();
      if (this.product._id) {
        this.inWishlist$ = this.store.select(isProductInWishlist(this.product._id));
      }
      this.maxQty = this.product.RemainingQuantity ?? 1;
      this.quantity = 1;
    }
  }

  selectMedia(url: string, isVideo: boolean): void {
    this.productService.handleImageActive(url, isVideo);
  }

  checkCartStatus(): void {
    if (!this.userId || !this.product?._id) return;
    this.genericService
      .getObservable(USER_CART_ITEM(this.userId, this.product._id))
      .subscribe({
        next: () => (this.isInCart = true),
        error: () => (this.isInCart = false),
      });
  }

  incrementQty(): void {
    if (this.quantity < this.maxQty) this.quantity++;
  }

  decrementQty(): void {
    if (this.quantity > 1) this.quantity--;
  }

  addToCart(): void {
    this.cartService.addCartProduct(this.product, this.quantity);
    this.isInCart = true;
  }

  // Thumbnail strip with the primary image first.
  get orderedImages(): any[] {
    return sortImagesPrimaryFirst(this.product?.Images);
  }

  isItemInWishlist(item: any): boolean {
    return this.wishlistService
      .getWishlistProducts()
      .some((p: any) => p.ProductID === item._id || p._id === item._id);
  }

  addToWishlist(): void {
    this.wishlistService.add_wishlist_product(this.product);
  }

  isItemInCart(item: any): boolean {
    return this.isInCart || this.cartItems.some((prd: any) => prd.ProductID === item._id);
  }

  openChat(): void {
    if (!this.userId) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.router.navigate(['/buyer/chat'], {
      queryParams: { productId: this.product._id },
    });
  }

  // Close the review modal after a successful post and let the parent reload the list
  onReviewSubmitted(): void {
    const closeBtn =
      this.reviewModalRef?.nativeElement.querySelector<HTMLElement>(
        '[data-bs-dismiss="modal"]',
      );
    closeBtn?.click();
    this.reviewSubmitted.emit();
  }
}
