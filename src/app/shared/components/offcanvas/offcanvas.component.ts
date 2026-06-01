import { Component } from '@angular/core';
import { UtilsService } from '../../services/utils.service';
import { IMobileMenu } from '../../types/menu-d-t';
import { mobile_menus } from '../../data/menu-data';
import { UserService } from '@shared/services/user.service';
import { selectUserRoles } from 'src/app/store/selectors/user.selectors';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-offcanvas',
  templateUrl: './offcanvas.component.html',
  styleUrls: ['./offcanvas.component.scss'],
})
export class OffcanvasComponent {
  public roles: number[] = [];

  constructor(
    public utilsService: UtilsService,
    private store: Store,
  ) {}

  mobile_menus: IMobileMenu[] = mobile_menus;

  activeMenu: string = '';

  ngOnInit(): void {
    this.store.select(selectUserRoles).subscribe((roles) => {
      this.roles = roles;
    });
  }

  handleOpenMenu(navTitle: string) {
    if (navTitle === this.activeMenu) {
      this.activeMenu = '';
    } else {
      this.activeMenu = navTitle;
    }
  }

  checkRole(menu: IMobileMenu) {
    if (menu.admin) return this.roles?.includes(1);
    if (menu.seller) return this.roles?.includes(2);
    if (menu.buyer) return this.roles?.includes(3);
    return true;
  }
}
