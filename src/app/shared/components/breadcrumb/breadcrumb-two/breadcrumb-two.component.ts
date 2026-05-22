import { Component, Input } from '@angular/core';
import { SiteContentService } from 'src/app/shared/services/site-content.service';
import { IBreadcrumb } from 'src/app/shared/types/breadcrumb-t';

@Component({
  selector: 'app-breadcrumb-two',
  templateUrl: './breadcrumb-two.component.html',
  styleUrls: ['./breadcrumb-two.component.scss'],
})
export class BreadcrumbTwoComponent {
  @Input() bg?: string;
  @Input() title!: string;
  @Input() subtitle!: string;

  // Static fallback until the CMS `breadcrumb` block loads.
  public bg_img = '/assets/img/page-title/page-title-3.jpg';

  constructor(private siteContentService: SiteContentService) {}

  ngOnInit() {
    // An explicit [bg] input is a per-page override and always wins.
    if (this.bg) {
      this.bg_img = this.bg;
      return;
    }
    this.siteContentService
      .getBlock<IBreadcrumb>('breadcrumb')
      .subscribe((items) => {
        if (items[0]?.bgImg) {
          this.bg_img = items[0].bgImg;
        }
      });
  }
}
