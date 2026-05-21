import { ViewportScroller } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { GET_RECIPIENTS } from '@config/index';
import { GenericService } from '@shared/services/generic.service';
import { ProductService } from 'src/app/shared/services/product.service';

@Component({
  selector: 'app-recipient-filtering',
  templateUrl: './recipient-filtering.component.html',
  styleUrls: ['./recipient-filtering.component.scss'],
})
export class RecipientFilteringComponent {
  public recipients: any[] = [];
  public recipient: string | null = null;

  constructor(
    public productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private viewScroller: ViewportScroller,
    private genericService: GenericService
  ) {}

  ngOnInit(): void {
    this.genericService.getObservable(GET_RECIPIENTS).subscribe({
      next: (response) => {
        const productRecipients = response.data?.map(
          (el: any) => el?.RecipientName
        );
        this.recipients = [...new Set(productRecipients)];
      },
      error: (err) => {
        this.recipients = [];
      },
    });
    this.route.queryParams.subscribe((params) => {
      this.recipient = params['recipient'] ? params['recipient'] : null;
    });
  }

  handleRecipientRoute(event: any) {
    const queryParams: Params = {
      recipient: (event.target as HTMLSelectElement).value,
    };
    this.router
      .navigate([], {
        relativeTo: this.route,
        queryParams,
        queryParamsHandling: 'merge',
        skipLocationChange: false,
      })
      .finally(() => {
        this.viewScroller.setOffset([120, 120]);
        this.viewScroller.scrollToAnchor('products'); // Anchore Link
      });
  }
}
