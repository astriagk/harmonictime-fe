import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { CartService } from '@shared/services/cart.service';
import { WishlistService } from '@shared/services/wishlist.service';
import { UserService } from '@shared/services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'Harmonic Time';

  constructor(
    private userService: UserService,
    private store: Store,
    public cartService: CartService,
    public wishlistService: WishlistService
  ) {}

  ngOnInit(): void {
    if (localStorage.getItem('token')) {
      this.userService.verifyAndRestoreSession();
    } else {
      this.cartService.loadGuestCart();
      this.wishlistService.loadGuestWishlist();
    }
  }
}
