import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { UserService } from '@shared/services/user.service';
import { selectUserData } from 'src/app/store/selectors/user.selectors';

@Component({
  selector: 'app-extra-info',
  templateUrl: './extra-info.component.html',
  styleUrls: ['./extra-info.component.scss'],
})
export class ExtraInfoComponent {
  public userData: any = null;

  constructor(private userService: UserService, private store: Store) {}

  ngOnInit(): void {
    this.store.select(selectUserData).subscribe((state) => {
      this.userData = state?.user?.data;
    });
  }

  navigate() {
    this.userService.logout();
  }
}
