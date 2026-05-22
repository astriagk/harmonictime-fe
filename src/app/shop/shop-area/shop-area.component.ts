import { Component, Input } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { normalizeDialColor } from '@shared/constants/dial-colors';
import { ProductService } from 'src/app/shared/services/product.service';
import { UtilsService } from 'src/app/shared/services/utils.service';
import { IProduct } from 'src/app/shared/types/product-d-t';
import { GenericService } from '@shared/services/generic.service';
import { PRODUCT } from '@config/index';
import { CartService } from '@shared/services/cart.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-shop-area',
  templateUrl: './shop-area.component.html',
  styleUrls: ['./shop-area.component.scss'],
})
export class ShopAreaComponent {
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
  public paginate: any = {}; // Pagination use only
  public sortBy: string = 'asc'; // Sorting Order
  public showFilters: boolean = false; // Toggle filter sidebar on mobile
  public loading: boolean = true; // Show skeleton until the first product response

  constructor(
    public productService: ProductService,
    public utilsService: UtilsService,
    private route: ActivatedRoute,
    private router: Router,
    private viewScroller: ViewportScroller,
    private genericService: GenericService,
    public cartService: CartService
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
      // Category Filter
      // if (this.category) {
      //   this.products = this.products.filter(
      //     (p) =>
      //       this.utilsService.convertToURL(p.parentCategory) === this.category
      //   );
      // }
      // sub category Filter
      // if (this.subcategory) {
      //   this.products = this.products.filter(
      //     (p) =>
      //       this.utilsService.convertToURL(p.category) === this.subcategory
      //   );
      // }
      // size Filter
      // if (this.size) {
      //   this.products = this.products.filter((product) => {
      //     return (
      //       product.sizes &&
      //       product.sizes.some((size) => size.toLowerCase() === this.size)
      //     );
      //   });
      // }
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
          return selectedBrands === p?.Details?.BrandName.toLowerCase(); // Check if product brand is in selected brands
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
    const url = PRODUCT;
    this.genericService
      .getObservable(url)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
      next: (response) => {
        this.products = response?.data;
        this.productsInitial = response?.data;
        this.paginate = this.productService.getPager(
          this.products.length,
          Number(+this.pageNo),
          this.pageSize
        );
        this.products = this.products.slice(
          this.paginate.startIndex,
          this.paginate.endIndex + 1
        );
      },
      error: (err) => {
        console.error(`Error fetching data for :`, err);
      },
    });
  }

  onSortingChange(value: string) {
    this.sortByFilter(value);
  }
  // SortBy Filter
  sortByFilter(value: string) {
    this.router
      .navigate([], {
        relativeTo: this.route,
        queryParams: { sortBy: value ? value : null },
        queryParamsHandling: 'merge', // preserve the existing query params in the route
        skipLocationChange: false, // do trigger navigation
      })
      .finally(() => {
        this.viewScroller.setOffset([120, 120]);
        this.viewScroller.scrollToAnchor('products'); // Anchore Link
      });
  }

  // product Pagination
  setPage(page: number) {
    this.router
      .navigate([], {
        relativeTo: this.route,
        queryParams: { page: page },
        queryParamsHandling: 'merge', // preserve the existing query params in the route
        skipLocationChange: false, // do trigger navigation
      })
      .finally(() => {
        this.viewScroller.setOffset([120, 120]);
        this.viewScroller.scrollToAnchor('products'); // Anchore Link
      });
  }

  // Toggle the filter sidebar visibility on mobile
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
