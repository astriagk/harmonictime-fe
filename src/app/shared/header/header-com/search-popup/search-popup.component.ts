import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import category_data from 'src/app/shared/data/category-data';
import { UtilsService } from 'src/app/shared/services/utils.service';
import { ICategoryType } from 'src/app/shared/types/category-d-t';

@Component({
  selector: 'app-search-popup',
  templateUrl: './search-popup.component.html',
  styleUrls: ['./search-popup.component.scss']
})
export class SearchPopupComponent implements OnInit, OnDestroy {

  public searchText: string = '';
  public productType: string = '';
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;
  private destroy$ = new Subject<void>();

  constructor (public utilsService:UtilsService,private router: Router){};

  ngOnInit(): void {
    // Focus the input each time the popup opens.
    this.utilsService.searchOpened$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.focusSearchInput());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // The panel transitions from `visibility: hidden` to `visible`; a hidden
  // element silently rejects focus. Poll a few animation frames until it's
  // actually visible, then focus.
  private focusSearchInput(retries = 10): void {
    const el = this.searchInput?.nativeElement;
    if (!el) return;
    if (getComputedStyle(el).visibility === 'visible') {
      el.focus();
      return;
    }
    if (retries > 0) {
      requestAnimationFrame(() => this.focusSearchInput(retries - 1));
    }
  }


   // Get all the children from the category_data array
   public allChildren: string[] = category_data.reduce((children: string[], category: ICategoryType) => {
    if (category.children && category.children.length > 0) {
      children.push(...category.children);
    }
    return children;
  }, []);

  // Create a new unique children array
  public uniqueChildren = [...new Set(this.allChildren)];

  handleProductType(productType: string) {
    if(productType === this.productType){
      this.productType = '';
    }
    else {
      this.productType = productType;
    }
  }

  handleSearchSubmit() {
    const q = this.searchText?.trim();
    // Nothing to search on.
    if (!q && !this.productType) {
      return;
    }
    const queryParams: { [key: string]: string | null } = {};
    if (q) {
      // Raw term goes to /products/search?q=; shop-area reads `q`. A text search
      // takes precedence over a category chip (server-side search owns the list).
      queryParams['q'] = q;
    } else if (this.productType) {
      // Text-less: reuse the products page's client-side category filter.
      queryParams['category'] = this.productType;
    }
    // Close the search overlay before navigating to the results.
    if (this.utilsService.isSearchOpen) {
      this.utilsService.handleSearchOpen();
    }
    this.router.navigate(['/buyer/products'], { queryParams });
    // Reset the popup so it's empty next time it's opened.
    this.searchText = '';
    this.productType = '';
  }
}
