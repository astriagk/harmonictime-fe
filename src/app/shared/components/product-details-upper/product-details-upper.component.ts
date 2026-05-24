import { Component, Input } from '@angular/core';
import { IProduct, Product } from '../../types/product-d-t';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import social_links, { ISocial } from '../../data/social-data';
import {
  getPrimaryImageUrl,
  sortImagesPrimaryFirst,
} from '../../utils/product-images';

@Component({
  selector: 'app-product-details-upper',
  templateUrl: './product-details-upper.component.html',
  styleUrls: ['./product-details-upper.component.scss'],
})
export class ProductDetailsUpperComponent {
  @Input() product!: any;
  @Input() bottomShow: boolean = true;
  @Input() style_2: boolean = false;
  public social_links: ISocial[] = social_links;

  constructor(
    public productService: ProductService,
    public cartService: CartService
  ) {}

  ngOnInit() {
    if (this.product) {
      this.productService.activeImg = getPrimaryImageUrl(this.product?.Images);
    }
  }

  // Thumbnail strip with the primary image first.
  get orderedImages(): any[] {
    return sortImagesPrimaryFirst(this.product?.Images);
  }
}
