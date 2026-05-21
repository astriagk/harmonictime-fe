import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GET_PRODUCT_BY_ID } from '@config/index';
import { GenericService } from '@shared/services/generic.service';
import { of, switchMap } from 'rxjs';
import { ProductService } from 'src/app/shared/services/product.service';
import { IProduct } from 'src/app/shared/types/product-d-t';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class DetailsComponent {
  public product: any;

  constructor(
    private route: ActivatedRoute,
    private genericService: GenericService,
    public router: Router
  ) {}

  ngOnInit() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const productId = params.get('id');
          if (productId) {
            const url = GET_PRODUCT_BY_ID + `${productId}`;
            return this.genericService.getObservable(url);
          }
          return of<IProduct | null>(null); // Emit null if there's no productId
        })
      )
      .subscribe((product: any) => {
        // TODO: need to work on the type of IProduct
        if (!product) {
          // Product not found, navigate to 404 page
          this.router.navigate(['/404']);
        } else {
          this.product = product?.data[0];
        }
      });
  }
}
