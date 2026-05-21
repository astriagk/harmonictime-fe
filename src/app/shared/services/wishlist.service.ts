import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Product } from '../types/product-d-t';

const state = {
  wishlists: JSON.parse(localStorage['wishlist_products'] || '[]')
}

@Injectable({
  providedIn: 'root'
})


export class WishlistService {

  constructor(private toastrService: ToastrService) { }

  public getWishlistProducts () {
    return state.wishlists;
  }

  // add_wishlist_product
  add_wishlist_product(payload: Product) {
    const isAdded = state.wishlists.findIndex((p: Product) => p._id === payload._id);
    if (isAdded !== -1) {
      state.wishlists = state.wishlists.filter((p: Product) => p._id !== payload._id);
      this.toastrService.error(`${payload.ProductName} removed from wishlist`);
    } else {
      state.wishlists.push(payload);
      this.toastrService.success(`${payload.ProductName} added to wishlist`);
    }
    localStorage.setItem("wishlist_products", JSON.stringify(state.wishlists));
  };
  // removeWishlist
  removeWishlist(payload: Product) {
    state.wishlists = state.wishlists.filter((p: Product) => p._id !== payload._id);
    this.toastrService.error(`${payload.ProductName} removed from wishlist`);
    localStorage.setItem("wishlist_products", JSON.stringify(state.wishlists));
  };
}
