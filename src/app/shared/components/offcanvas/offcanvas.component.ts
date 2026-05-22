import { Component } from '@angular/core';
import { UtilsService } from '../../services/utils.service';
import { IMobileMenu } from '../../types/menu-d-t';
import { mobile_menus } from '../../data/menu-data';
import { UserService } from '@shared/services/user.service';
import { selectUserData } from 'src/app/store/selectors/user.selectors';
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
    this.store.select(selectUserData).subscribe((state) => {
      this.roles = state?.user?.data?.roles;
    });
  }

  handleOpenMenu(navTitle: string) {
    if (navTitle === this.activeMenu) {
      this.activeMenu = '';
    } else {
      this.activeMenu = navTitle;
    }
  }

  checkRole(value: boolean | undefined) {
    // if (value) return this.roles?.includes(2);
    return true;
  }
}
