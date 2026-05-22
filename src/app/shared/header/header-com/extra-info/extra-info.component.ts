import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { UserService } from '@shared/services/user.service';
import { selectUserData } from 'src/app/store/selectors/user.selectors';
import { selectCartItems } from 'src/app/store/selectors/cart.selectors';
import { selectWishlistItems } from 'src/app/store/selectors/wishlist.selectors';

@Component({
  selector: 'app-extra-info',
  templateUrl: './extra-info.component.html',
  styleUrls: ['./extra-info.component.scss'],
})
export class ExtraInfoComponent {
  public userData: any = null;
  public cartCount = 0;
  public wishlistCount = 0;

  constructor(private userService: UserService, private store: Store) {}

  ngOnInit(): void {
    this.store.select(selectUserData).subscribe((state) => {
      this.userData = state?.user?.data;
    });
    this.store.select(selectCartItems).subscribe((items) => {
      this.cartCount = items?.length || 0;
    });
    this.store.select(selectWishlistItems).subscribe((items) => {
      this.wishlistCount = items?.length || 0;
    });
  }

  navigate() {
    this.userService.logout();
  }
}
