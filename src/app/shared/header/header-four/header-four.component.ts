import { Component, HostListener } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { UtilsService } from '../../services/utils.service';
import { Store } from '@ngrx/store';
import { selectCartItems } from 'src/app/store/selectors/cart.selectors';
import { selectUserData } from 'src/app/store/selectors/user.selectors';

@Component({
  selector: 'app-header-four',
  templateUrl: './header-four.component.html',
  styleUrls: ['./header-four.component.scss'],
})
export class HeaderFourComponent {
  public sticky: boolean = false;
  public token: string = '';
  public cartItems: any = [];

  constructor(
    public cartService: CartService,
    public utilsService: UtilsService,
    public store: Store
  ) {}

  ngOnInit(): void {
    this.token = localStorage.getItem('token') || '';
    // Re-read the token on every user-state change so the header reflects
    // login/logout immediately (no page reload needed)
    this.store.select(selectUserData).subscribe(() => {
      this.token = localStorage.getItem('token') || '';
    });
    this.store.select(selectCartItems).subscribe((state) => {
      if (state?.length) {
        this.cartItems = state;
      } else {
        this.cartItems = [];
      }
    });
  }

  // sticky nav
  @HostListener('window:scroll', ['$event']) onscroll() {
    if (window.scrollY > 80) {
      this.sticky = true;
    } else {
      this.sticky = false;
    }
  }
}
