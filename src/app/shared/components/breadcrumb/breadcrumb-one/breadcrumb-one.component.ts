import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { SiteContentService } from 'src/app/shared/services/site-content.service';
import { IBreadcrumb } from 'src/app/shared/types/breadcrumb-t';
import { selectUserData } from 'src/app/store/selectors/user.selectors';

@Component({
  selector: 'app-breadcrumb-one',
  templateUrl: './breadcrumb-one.component.html',
  styleUrls: ['./breadcrumb-one.component.scss'],
})
export class BreadcrumbOneComponent {
  @Input() bg?: string;
  @Input() title!: string;
  @Input() subtitle!: string;

  public bg_img = 'https://harmonic-time.s3.us-east-1.amazonaws.com/site-content/breadcrumb/c8fc84e8-2316-4bee-9e64-73b517f5318f-1779435215818';

  public sellerVerificationNote: string | null = null;
  public sellerVerificationStatus: string | null = null;
  public bannerDismissed = false;

  get showVerificationBanner(): boolean {
    const relevantStatus = ['Pending', 'Rejected', 'Resubmitted'].includes(this.sellerVerificationStatus ?? '');
    return !this.bannerDismissed && relevantStatus && !!this.sellerVerificationNote;
  }

  constructor(
    private siteContentService: SiteContentService,
    private store: Store,
  ) {}

  ngOnInit() {
    if (this.bg) {
      this.bg_img = this.bg;
    } else {
      this.siteContentService
        .getBlock<IBreadcrumb>('breadcrumb')
        .subscribe((items) => {
          if (items[0]?.bgImg) {
            this.bg_img = items[0].bgImg;
          }
        });
    }

    this.store.select(selectUserData).subscribe((state) => {
      const user = state?.user?.data;
      this.sellerVerificationNote = user?.sellerVerificationNote ?? null;
      this.sellerVerificationStatus = user?.sellerVerificationStatus ?? null;
    });
  }
}
