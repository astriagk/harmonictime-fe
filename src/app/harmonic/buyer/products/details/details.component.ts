import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { loadProductDetail } from 'src/app/store/actions/product.actions';
import {
  selectProductDetail,
  selectProductDetailLoading,
} from 'src/app/store/selectors/product.selectors';
import { SeoService } from '@shared/services/seo.service';
import { getPrimaryImageUrl } from '@shared/utils/product-images';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class DetailsComponent implements OnInit, OnDestroy {
  public product: any;
  public loading = true;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private store: Store,
    private seo: SeoService
  ) {}

  ngOnInit() {
    // Something sensible in the head while the product loads; the real tags
    // land in applySeo() once it arrives.
    this.seo.update({ title: 'Watch Details', type: 'product' });

    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const id = params.get('id');
        if (!id) {
          this.router.navigate(['/404']);
          return;
        }
        this.store.dispatch(loadProductDetail({ id }));
      });

    this.store
      .select(selectProductDetailLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => (this.loading = loading));

    this.store
      .select(selectProductDetail)
      .pipe(takeUntil(this.destroy$))
      .subscribe((product) => {
        this.product = product;
        if (product) this.applySeo(product);
      });
  }

  ngOnDestroy() {
    // Hand the head back to the site defaults, so the next route doesn't
    // inherit this product's title, image or Product JSON-LD.
    this.seo.reset();
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Build the head from the loaded product: a title that reads as a real search
   * result, the description as the snippet, the lead image for link previews,
   * and Product structured data so the listing can qualify for a rich result.
   */
  private applySeo(product: any): void {
    const brand = product?.Details?.WatchMarkerName;
    const name = product?.ProductName ?? 'Watch';
    const image = getPrimaryImageUrl(product?.Images);
    const path = `/buyer/product-details/${product?._id}`;
    const price = this.effectivePrice(product);

    this.seo.update({
      title: brand ? `${name} — ${brand}` : name,
      description:
        product?.Description ||
        `Buy the ${name} on Krono2 — an authenticated pre-owned watch from a verified seller, with secure payment and pan-India delivery.`,
      image: image || undefined,
      url: path,
      type: 'product',
    });

    const site = environment.siteUrl.replace(/\/$/, '');

    // Product + BreadcrumbList in one @graph: the product data drives the rich
    // result, the breadcrumb drives the "krono2.com › products › …" trail that
    // replaces the raw URL in search listings.
    this.seo.setStructuredData({
      '@context': 'https://schema.org',
      '@graph': [
        this.productSchema(product, { name, brand, image, path, price, site }),
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: `${site}/`,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Watches',
              item: `${site}/buyer/products`,
            },
            // The last crumb is the current page, so per Google's guidance it
            // carries no `item` URL.
            { '@type': 'ListItem', position: 3, name },
          ],
        },
      ],
    });
  }

  /** The Product node of the page's structured data. */
  private productSchema(
    product: any,
    ctx: {
      name: string;
      brand?: string;
      image: string;
      path: string;
      price: number | null;
      site: string;
    }
  ): Record<string, unknown> {
    const { name, brand, image, path, price, site } = ctx;

    return {
      '@type': 'Product',
      name,
      ...(brand ? { brand: { '@type': 'Brand', name: brand } } : {}),
      ...(product?.Description ? { description: product.Description } : {}),
      ...(image ? { image: [image] } : {}),
      ...(product?.Details?.ManufacturerProductNumber
        ? { mpn: product.Details.ManufacturerProductNumber }
        : {}),
      ...(product?.Details?.DialColorName
        ? { color: product.Details.DialColorName }
        : {}),
      ...(product?.Details?.CaseMaterialName
        ? { material: product.Details.CaseMaterialName }
        : {}),
      ...(price != null
        ? {
            offers: {
              '@type': 'Offer',
              price: Number(price.toFixed(2)),
              priceCurrency: 'INR',
              // The catalogue tracks no stock level — a listing is live until
              // it sells, so anything with a page is buyable.
              availability: 'https://schema.org/InStock',
              url: `${site}${path}`,
            },
          }
        : {}),
    };
  }

  /** The price a buyer actually pays — the same discount the page displays. */
  private effectivePrice(product: any): number | null {
    const base = Number(product?.DisplayPrice);
    if (!Number.isFinite(base)) return null;

    const discount = Number(product?.Offer?.DiscountPercentage);
    if (!product?.Offer?.IsActive || !Number.isFinite(discount)) return base;

    return base * (1 - discount / 100);
  }
}
