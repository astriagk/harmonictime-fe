import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { normalizeDialColor } from '@shared/constants/dial-colors';
import { ProductService } from 'src/app/shared/services/product.service';
import { UtilsService } from 'src/app/shared/services/utils.service';
import { CartService } from '@shared/services/cart.service';
import { loadProducts } from 'src/app/store/actions/product.actions';
import {
  selectProducts,
  selectProductsLoading,
} from 'src/app/store/selectors/product.selectors';

@Component({
  selector: 'app-shop-area',
  templateUrl: './shop-area.component.html',
  styleUrls: ['./shop-area.component.scss'],
})
export class ShopAreaComponent implements OnInit, OnDestroy {
  @Input() shop_right = false;
  @Input() shop_4_col = false;
  @Input() shop_3_col = false;

  public products: any[] = [];
  public productsInitial: any[] = [];
  public minPrice: number = 0;
  public maxPrice: number = 0;
  public niceSelectOptions = this.productService.filterSelect;
  public brands: string[] = [];
  public category: string | null = null;
  public subcategory: string | null = null;
  public size: string | null = null;
  public color: string | null = null;
  public brand: string | null = null;
  public recipient: string | null = null;
  public movement: string | null = null;
  public strapMaterial: string | null = null;
  public caseMaterial: string | null = null;
  public watchMarker: string | null = null;
  public pageNo: number = 1;
  public pageSize: number = 12;
  public paginate: any = {};
  public sortBy: string = 'asc';
  public showFilters: boolean = false;
  public loading: boolean = true;

  private destroy$ = new Subject<void>();

  constructor(
    public productService: ProductService,
    public utilsService: UtilsService,
    private route: ActivatedRoute,
    private router: Router,
    private viewScroller: ViewportScroller,
    public cartService: CartService,
    private store: Store
  ) {
    this.route.queryParams.subscribe((params) => {
      this.maxPrice = params['maxPrice'] ? params['maxPrice'] : this.maxPrice;
      this.minPrice = params['minPrice'] ? params['minPrice'] : this.minPrice;
      this.brand = params['brand'] ? params['brand'] : null;
      this.category = params['category'] ? params['category'] : null;
      this.subcategory = params['subcategory'] ? params['subcategory'] : null;
      this.size = params['size'] ? params['size'] : null;
      this.color = params['color'] ? normalizeDialColor(params['color']) : null;
      this.recipient = params['recipient'] ? params['recipient'] : null;
      this.movement = params['movement'] ? params['movement'] : null;
      this.strapMaterial = params['strapMaterial']
        ? params['strapMaterial']
        : null;
      this.caseMaterial = params['caseMaterial']
        ? params['caseMaterial']
        : null;
      this.watchMarker = params['watchMarker'] ? params['watchMarker'] : null;
      this.pageNo = params['page'] ? params['page'] : this.pageNo;
      this.sortBy = params['sortBy'] ? params['sortBy'] : 'high';

      let filteredProducts: any = [];

      // Sorting Filter
      filteredProducts = this.productService.sortProducts(
        this.productsInitial,
        this.sortBy
      );
      // color Filter
      if (this.color) {
        filteredProducts = filteredProducts.filter((product: any) => {
          return (
            product?.Details?.DialColorName &&
            normalizeDialColor(product?.Details?.DialColorName) === this.color
          );
        });
      }
      // brand Filter
      if (this.brand) {
        filteredProducts = filteredProducts.filter((p: any) => {
          const selectedBrands = this.brand?.toLowerCase();
          return selectedBrands === p?.Details?.BrandName.toLowerCase();
        });
      }
      // category Filter
      if (this.category) {
        filteredProducts = filteredProducts.filter(
          (p: any) =>
            this.category?.toLowerCase() ===
            p?.Details?.CategoryName?.toLowerCase()
        );
      }
      // recipient Filter
      if (this.recipient) {
        filteredProducts = filteredProducts.filter(
          (p: any) =>
            this.recipient?.toLowerCase() ===
            p?.Details?.RecipientName?.toLowerCase()
        );
      }
      // movement Filter
      if (this.movement) {
        filteredProducts = filteredProducts.filter(
          (p: any) =>
            this.movement?.toLowerCase() ===
            p?.Details?.MovementName?.toLowerCase()
        );
      }
      // strap material Filter
      if (this.strapMaterial) {
        filteredProducts = filteredProducts.filter(
          (p: any) =>
            this.strapMaterial?.toLowerCase() ===
            p?.Details?.StrapMaterialName?.toLowerCase()
        );
      }
      // case material Filter
      if (this.caseMaterial) {
        filteredProducts = filteredProducts.filter(
          (p: any) =>
            this.caseMaterial?.toLowerCase() ===
            p?.Details?.CaseMaterialName?.toLowerCase()
        );
      }
      // watch marker Filter
      if (this.watchMarker) {
        filteredProducts = filteredProducts.filter(
          (p: any) =>
            this.watchMarker?.toLowerCase() ===
            p?.Details?.WatchMarkerName?.toLowerCase()
        );
      }
      // Price Filter
      if (this.minPrice || this.maxPrice) {
        filteredProducts = filteredProducts?.filter(
          (p: any) =>
            p.Price >= Number(this.minPrice) && p.Price <= Number(this.maxPrice)
        );
      }
      // Paginate Products
      this.maxPrice = this.productService.maxPrice(filteredProducts);
      this.paginate = this.productService.getPager(
        filteredProducts.length,
        Number(+this.pageNo),
        this.pageSize
      );
      this.products = filteredProducts.slice(
        this.paginate.startIndex,
        this.paginate.endIndex + 1
      );
    });
  }

  ngOnInit() {
    this.store.dispatch(loadProducts());

    this.store
      .select(selectProductsLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => (this.loading = loading));

    this.store
      .select(selectProducts)
      .pipe(takeUntil(this.destroy$))
      .subscribe((products) => {
        if (products.length) {
          this.productsInitial = products;
          this.paginate = this.productService.getPager(
            products.length,
            Number(+this.pageNo),
            this.pageSize
          );
          this.products = products.slice(
            this.paginate.startIndex,
            this.paginate.endIndex + 1
          );
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSortingChange(value: string) {
    this.sortByFilter(value);
  }

  sortByFilter(value: string) {
    this.router
      .navigate([], {
        relativeTo: this.route,
        queryParams: { sortBy: value ? value : null },
        queryParamsHandling: 'merge',
        skipLocationChange: false,
      })
      .finally(() => {
        this.viewScroller.setOffset([120, 120]);
        this.viewScroller.scrollToAnchor('products');
      });
  }

  setPage(page: number) {
    this.router
      .navigate([], {
        relativeTo: this.route,
        queryParams: { page: page },
        queryParamsHandling: 'merge',
        skipLocationChange: false,
      })
      .finally(() => {
        this.viewScroller.setOffset([120, 120]);
        this.viewScroller.scrollToAnchor('products');
      });
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  handleResetFilter(event: any) {
    this.router.navigate(['/buyer/products']);
    setTimeout(() => {
      this.products = this.productsInitial;
    }, 10);
  }
}
