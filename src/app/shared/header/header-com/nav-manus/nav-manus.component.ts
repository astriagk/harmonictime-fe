import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { UserService } from '@shared/services/user.service';
import menuData from 'src/app/shared/data/menu-data';
import { IMenuType } from 'src/app/shared/types/menu-d-t';
import { selectUserData } from 'src/app/store/selectors/user.selectors';

@Component({
  selector: 'app-nav-manus',
  templateUrl: './nav-manus.component.html',
  styleUrls: ['./nav-manus.component.scss'],
})
export class NavManusComponent {
  public menu_data: IMenuType[] = menuData;
  public roles: number[] = [];

  bg: string = '/assets/img/bg/mega-menu-bg.jpg';

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store.select(selectUserData).subscribe((state) => {
      this.roles = state.user?.data?.roles;
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
    return true;
  }
}
