import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { companyDetails } from '@shared/constants/companyDetails';
import { CartService } from '@shared/services/cart.service';
import { GenericService } from '@shared/services/generic.service';
import { UserService } from '@shared/services/user.service';
import { loadOrders } from 'src/app/store/actions/orders.actions';
import { Order } from 'src/app/store/models/orders.models';
import { selectCartItems } from 'src/app/store/selectors/cart.selectors';
import { selectOrders } from 'src/app/store/selectors/orders.selectors';
import { selectUserData } from 'src/app/store/selectors/user.selectors';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent {
  public userData: any = {};
  public mail = `mailt:${companyDetails.email}`;
  public cartItems: any = [];
  public orders: Order[] = [];

  constructor(public cartService: CartService, private store: Store) {}

  ngOnInit(): void {
    this.store.select(selectUserData).subscribe((state) => {
      this.userData = state?.user?.data;
      const userId = this.userData?._id;
      if (userId) {
        this.store.dispatch(loadOrders({ userId }));
      }
    });
    this.store.select(selectCartItems).subscribe((state) => {
      if (state?.length) {
        this.cartItems = state;
      } else {
        this.cartItems = [];
      }
    });
    this.store.select(selectOrders).subscribe((state) => {
      if (state?.length) {
        this.orders = state;
      } else {
        this.orders = [];
      }
    });
  }
}
