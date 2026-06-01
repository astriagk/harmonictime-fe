import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import menuData from 'src/app/shared/data/menu-data';
import { IMenuType } from 'src/app/shared/types/menu-d-t';
import { selectUserRoles, selectSellerVerificationStatus } from 'src/app/store/selectors/user.selectors';

@Component({
  selector: 'app-nav-manus',
  templateUrl: './nav-manus.component.html',
  styleUrls: ['./nav-manus.component.scss'],
})
export class NavManusComponent {
  public menu_data: IMenuType[] = menuData;
  public roles: number[] = [];
  public sellerVerificationStatus: string | null = null;

  bg: string = '/assets/img/bg/mega-menu-bg.jpg';

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store.select(selectUserRoles).subscribe((roles) => {
      this.roles = roles;
    });
    this.store.select(selectSellerVerificationStatus).subscribe((status) => {
      this.sellerVerificationStatus = status;
    });
  }

  getMenuClasses(item: IMenuType): string {
    const classes = [];
    if (item.hasDropdown && !item.megamenu) {
      classes.push('active', 'has-dropdown');
    } else if (item.megamenu) {
      classes.push('mega-menu', 'has-dropdown');
    }
    return classes.join(' ');
  }

  checkRole(item: IMenuType) {
    if (item.admin) return this.roles?.includes(1);
    if (item.seller) return this.roles?.includes(2) && this.sellerVerificationStatus === 'Approved';
    if (item.buyer) return this.roles?.includes(3);
    return true;
  }
}
