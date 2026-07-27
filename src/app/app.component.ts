import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter } from 'rxjs/operators';
import { CartService } from '@shared/services/cart.service';
import { WishlistService } from '@shared/services/wishlist.service';
import { UserService } from '@shared/services/user.service';
import { SeoService, SeoTags } from '@shared/services/seo.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'krono';

  constructor(
    private userService: UserService,
    private store: Store,
    public cartService: CartService,
    public wishlistService: WishlistService,
    private router: Router,
    private route: ActivatedRoute,
    private seo: SeoService,
  ) {}

  ngOnInit(): void {
    if (localStorage.getItem('token')) {
      this.userService.verifyAndRestoreSession();
    } else {
      this.cartService.loadGuestCart();
      this.wishlistService.loadGuestWishlist();
    }

    this.applyRouteSeo();
  }

  /**
   * Drive the document head off route data. Every navigation reads the deepest
   * activated route's `data.seo` block and applies it, so each route gets its
   * own title/description/canonical instead of all of them sharing index.html's.
   *
   * Routes that build their tags from loaded data (a product page) set
   * `managedByComponent` and are skipped here — the component owns the head for
   * as long as it is on screen.
   */
  private applyRouteSeo(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        let deepest = this.route;
        while (deepest.firstChild) deepest = deepest.firstChild;

        const tags: (SeoTags & { managedByComponent?: boolean }) | undefined =
          deepest.snapshot.data['seo'];
        if (tags?.managedByComponent) return;

        // Query strings and fragments are navigation state, not distinct pages —
        // strip them so every variant canonicalises to the same URL.
        const path = this.router.url.split(/[?#]/)[0];
        this.seo.update({ ...tags, url: path });
      });
  }
}
