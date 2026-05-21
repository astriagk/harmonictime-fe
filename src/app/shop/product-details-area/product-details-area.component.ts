import { Component, Input, SimpleChanges } from '@angular/core';
import { IProduct } from 'src/app/shared/types/product-d-t';

@Component({
  selector: 'app-product-details-area',
  templateUrl: './product-details-area.component.html',
  styleUrls: ['./product-details-area.component.scss'],
})
export class ProductDetailsAreaComponent {
  @Input() product: any;

  // Dummy reviews until a reviews API is wired up
  public reviews = [
    {
      img: 'assets/img/blog/comments/avater-1.png',
      name: 'Arthur Holloway',
      time: '2 days ago',
      rating: 5,
      review_desc:
        'Absolutely stunning timepiece. The finish is flawless and it feels even better on the wrist than in the photos.',
    },
    {
      img: 'assets/img/blog/comments/avater-1.png',
      name: 'Mei Tanaka',
      time: '1 week ago',
      rating: 4,
      review_desc:
        'Beautiful watch and great craftsmanship. Delivery was quick and the packaging felt premium.',
    },
    {
      img: 'assets/img/blog/comments/avater-1.png',
      name: 'Daniel Okafor',
      time: '3 weeks ago',
      rating: 5,
      review_desc:
        'Exceeded my expectations. Keeps perfect time and the strap is very comfortable for daily wear.',
    },
  ];
}
