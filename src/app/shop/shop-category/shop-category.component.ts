import { Component, Input } from '@angular/core';
import { finalize } from 'rxjs';
import category_data from 'src/app/shared/data/category-data';
import { UtilsService } from 'src/app/shared/services/utils.service';
import { SiteContentService } from 'src/app/shared/services/site-content.service';
import { ICategoryType } from 'src/app/shared/types/category-d-t';

@Component({
  selector: 'app-shop-category',
  templateUrl: './shop-category.component.html',
  styleUrls: ['./shop-category.component.scss'],
})
export class ShopCategoryComponent {
  @Input() style_2: Boolean = false;
  @Input() style_3: Boolean = false;
  @Input() style_4: Boolean = false;
  @Input() shop_category_2: Boolean = false;
  // Static data is the fallback until the CMS block loads.
  public category_data: ICategoryType[] = category_data;
  // Show a skeleton until the CMS block resolves, so the fallback data isn't
  // briefly shown then swapped.
  public loading = true;

  constructor(
    public utilsService: UtilsService,
    private siteContentService: SiteContentService
  ) {}

  ngOnInit() {
    this.siteContentService
      .getBlock<ICategoryType>('category_banner')
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((banners) => {
        if (banners.length) {
          this.category_data = banners;
        }
      });
  }
}
