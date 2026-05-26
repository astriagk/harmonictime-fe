import { Component, HostListener, Input, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { UtilsService } from '../../services/utils.service';
import { Store } from '@ngrx/store';
import { selectUserData } from 'src/app/store/selectors/user.selectors';

@Component({
  selector: 'app-header-one',
  templateUrl: './header-one.component.html',
  styleUrls: ['./header-one.component.scss']
})
export class HeaderOneComponent implements OnInit {
  @Input() header_big = false;
  @Input() white_bg = false;
  @Input() transparent = false;

  public sticky = false;
  public isLoggedIn = false;
  public isSeller = false;

  constructor(
    public cartService: CartService,
    public utilsService: UtilsService,
    private store: Store,
  ) {}

  ngOnInit(): void {
    this.store.select(selectUserData).subscribe((state) => {
      this.isLoggedIn = !!state?.user?.data;
      const roles: number[] = state?.user?.data?.roles ?? [];
      this.isSeller = roles.length > 0 && !roles.includes(1);
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
