import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { CartService } from 'src/app/shared/services/cart.service';
import { selectCartItems } from 'src/app/store/selectors/cart.selectors';

@Component({
  selector: 'app-mini-cart',
  templateUrl: './mini-cart.component.html',
  styleUrls: ['./mini-cart.component.scss'],
})
export class MiniCartComponent {
  public cartItems: any = [];

  constructor(public cartService: CartService, public store: Store) {}

  ngOnInit(): void {
    this.store.select(selectCartItems).subscribe((state) => {
      if (state?.length) {
        this.cartItems = state;
      } else {
        this.cartItems = [];
      }
    });
  }
}
