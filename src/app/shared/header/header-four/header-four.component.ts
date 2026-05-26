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
  public chatRoute = '/buyer/chat';

  constructor(
    public cartService: CartService,
    public utilsService: UtilsService,
    public store: Store
  ) {}

  ngOnInit(): void {
    this.token = localStorage.getItem('token') || '';
    this.store.select(selectUserData).subscribe((state) => {
      this.token = localStorage.getItem('token') || '';
      const roles: number[] = state?.user?.data?.roles ?? [];
      // seller = has roles but not admin (role 1)
      this.chatRoute = (roles.length > 0 && !roles.includes(1))
        ? '/seller/chat'
        : '/buyer/chat';
    });
    this.store.select(selectCartItems).subscribe((state) => {
      this.cartItems = state?.length ? state : [];
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
