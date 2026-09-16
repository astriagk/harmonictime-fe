import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import Swiper from 'swiper';
import { Store } from '@ngrx/store';
import { HeroSliderData } from 'src/app/shared/data/hero-slider-data';
import { IHeroSlider } from 'src/app/shared/types/hero-slider-t';
import { IVideoArea } from 'src/app/shared/types/video-area-t';
import { EffectFade, Pagination } from 'swiper/modules';
import { IBlogCard } from 'src/app/shared/types/blog-d-t';
import { BlogService } from 'src/app/shared/services/blog.service';
import { UtilsService } from 'src/app/shared/services/utils.service';
import { SiteContentService } from 'src/app/shared/services/site-content.service';
import { finalize, Subject, takeUntil } from 'rxjs';
import { loadProducts } from 'src/app/store/actions/product.actions';
import {
  selectProducts,
  selectProductsLoading,
} from 'src/app/store/selectors/product.selectors';

@Component({
  selector: 'app-home-seven',
  templateUrl: './home-seven.component.html',
  styleUrls: ['./home-seven.component.scss'],
})
export class HomeSevenComponent implements OnDestroy {
  @ViewChild('heroSliderContainer') heroSliderContainer!: ElementRef;
  @ViewChild('productSliderContainer') productSliderContainer!: ElementRef;
  @ViewChild('blogSliderContainer') blogSliderContainer!: ElementRef;
  @ViewChild('brandSliderContainer') brandSliderContainer!: ElementRef;

  public swiperInstance: Swiper | undefined;
  public productSliderInstance: Swiper | undefined;
  public blogSliderInstance: Swiper | undefined;
  public brandSliderInstance: Swiper | undefined;

  private viewInitialized = false;
  private heroDataReady = false;
  private heroInitDone = false;
  private blogDataReady = false;
  private blogInitDone = false;
  private productInitDone = false;
  private destroy$ = new Subject<void>();
  // Drives the hero shimmer overlay: true once Swiper has built the slider, so
  // we mask the stacked/unstyled slides during the cold CMS-load window.
  public heroReady = false;
  // Drives the video-area shimmer: true once the CMS `video_area` block has
  // resolved, so the static fallback isn't shown then swapped.
  public videoReady = false;
  // Drives the blog-strip shimmer: true once the blog list request settles.
  public blogsReady = false;
  // The CMS `video_area` block is the fallback for the managed video grid:
  // it only appears once <app-videos-area> reports that nothing is published.
  public showFallbackVideo = false;
  // Drives the bestseller/featured shimmers: true once the catalog request
  // settles (the store starts `loading: true` on the very first load).
  public productsReady = false;

  public hero_slider_data: IHeroSlider[] = HeroSliderData.hero_slider_seven;
  // Latest published posts from the API — there's no static fallback, the strip
  // is hidden when nothing comes back.
  public blog_items: IBlogCard[] = [];
  // Fixed-length array driving the loading skeleton's *ngFor, held as a field
  // so *ngFor isn't handed a new array on every change-detection pass.
  public blogSkeletonSlots: number[] = [0, 1];

  // Static fallback until the CMS `video_area` block loads.
  public video_area: IVideoArea = {
    bgImg:
      'https://harmonic-time.s3.us-east-1.amazonaws.com/site-content/video_area/dadacacb-09fc-40a7-bde1-8f0c38f0e1bb-1779435991494',
    videoTitle: 'Art of Restoring',
    videoId: '8nsL3Uryv0U',
    description:
      '"Art of Restoring" celebrates the craftsmanship behind bringing vintage and pre-owned watches back to life with precision, care, and timeless passion.',
  };

  // The catalog has no "bestseller"/"featured" flag, so the home page shows a
  // random draw from the live products: four cards and two large images for the
  // bestseller grid, and a separate draw for the featured slider. Picked once
  // per load and held in fields — re-shuffling inside the template would
  // reorder the slides on every change-detection pass.
  public big_item_1: any | undefined;
  public big_item_2: any | undefined;
  public sm_best_prd: any[] = [];
  public featured_products: any[] = [];
  // Fixed-length arrays backing the loading skeletons' *ngFor.
  public bestsellerSkeletonSlots: number[] = [0, 1, 2, 3];
  public featuredSkeletonSlots: number[] = [0, 1, 2];

  constructor(
    public utilsService: UtilsService,
    private siteContentService: SiteContentService,
    private blogService: BlogService,
    private store: Store,
  ) {}

  ngOnInit() {
    this.loadHeroSlider();
    this.loadVideoArea();
    this.loadBlogs();
    this.loadCatalog();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Live catalog for the bestseller grid and the featured slider. The effect
  // no-ops when the products are already in the store, so navigating back here
  // doesn't refetch.
  private loadCatalog() {
    this.store
      .select(selectProductsLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => (this.productsReady = !loading));

    this.store
      .select(selectProducts)
      .pipe(takeUntil(this.destroy$))
      .subscribe((products) => {
        this.pickHomeProducts(products ?? []);
        this.setupProductSwiper();
      });

    this.store.dispatch(loadProducts());
  }

  // One random draw for the bestseller block (4 cards + 2 big images) and
  // another for the featured slider. On a small catalog the two draws can
  // overlap, which is fine — better than leaving a section empty.
  private pickHomeProducts(products: any[]) {
    const pool = this.shuffle(products);
    this.sm_best_prd = pool.slice(0, 4);
    this.big_item_1 = pool[4];
    this.big_item_2 = pool[5];
    this.featured_products = this.shuffle(products).slice(0, 8);
  }

  // Fisher-Yates on a copy — the source array comes from the (frozen) NgRx
  // store, and Array.sort()/swap would mutate it in place.
  private shuffle(items: any[]): any[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  // Same two-gate init as the hero and blog sliders: the view must exist and
  // the products must have landed before Swiper measures the slides.
  private setupProductSwiper() {
    if (
      this.productInitDone ||
      !this.viewInitialized ||
      !this.featured_products.length
    ) {
      return;
    }
    this.productInitDone = true;
    // Defer so Angular has rendered the *ngFor slides before Swiper measures.
    setTimeout(() => this.initProductSwiper());
  }

  private initProductSwiper() {
    this.productSliderInstance?.destroy(true, true);
    this.productSliderInstance = new Swiper('.product__slider-active', {
      slidesPerView: 3,
      spaceBetween: 30,
      breakpoints: {
        '992': {
          slidesPerView: 3,
        },
        '768': {
          slidesPerView: 2,
        },
        '576': {
          slidesPerView: 2,
        },
        '0': {
          slidesPerView: 1,
        },
      },
    });
  }

  // Latest posts for the home blog strip. The slider is only built once these
  // land, so Swiper measures the real slides instead of an empty wrapper.
  private loadBlogs() {
    this.blogService
      .list({ page: 1, limit: 6 })
      .pipe(
        finalize(() => {
          // Flip the shimmer off first: the slider markup sits behind
          // `blogsReady`, so it can't be measured before this runs.
          this.blogsReady = true;
          this.blogDataReady = true;
          this.setupBlogSwiper();
        }),
      )
      .subscribe({
        next: (res) => (this.blog_items = res?.items ?? []),
        error: () => (this.blog_items = []),
      });
  }

  // Same two-gate init as the hero: the view must exist and the posts must have
  // resolved before Swiper is built, and only ever once.
  private setupBlogSwiper() {
    if (
      this.blogInitDone ||
      !this.viewInitialized ||
      !this.blogDataReady ||
      !this.blog_items.length
    ) {
      return;
    }
    this.blogInitDone = true;
    // Defer so Angular has rendered the *ngFor slides before Swiper measures.
    setTimeout(() => this.initBlogSwiper());
  }

  private initBlogSwiper() {
    this.blogSliderInstance?.destroy(true, true);
    this.blogSliderInstance = new Swiper('.blog__slider-active', {
      slidesPerView: 2,
      spaceBetween: 30,
      breakpoints: {
        '768': {
          slidesPerView: 2,
        },
        '576': {
          slidesPerView: 1,
        },
        '0': {
          slidesPerView: 1,
        },
      },
    });
  }

  // The detail route resolves by slug, falling back to the id for posts saved
  // before slugs existed.
  public blogLink(blog: IBlogCard): string {
    return blog?.Slug || blog?._id;
  }

  // <app-videos-area> emits how many published videos it rendered. Only when
  // there are none do we fall back to the single CMS video block.
  public onVideosLoaded(count: number) {
    this.showFallbackVideo = count === 0;
  }

  // Pull the video area block from the CMS (/site-content); keep the static
  // fallback above if it's absent.
  private loadVideoArea() {
    this.siteContentService
      .getBlock<IVideoArea>('video_area')
      .pipe(finalize(() => (this.videoReady = true)))
      .subscribe((items) => {
        if (items.length) {
          this.video_area = items[0];
        }
      });
  }

  // Pull the hero slider block from the CMS (/site-content) and swap it in.
  // Falls back to the static data above if it's absent.
  private loadHeroSlider() {
    this.siteContentService
      .getBlock<IHeroSlider>('hero_slider')
      .subscribe((slides) => {
        if (slides.length) {
          this.hero_slider_data = slides;
        }
        // Data has resolved (CMS slides or empty -> keep fallback). Mark ready
        // and try to init; the cache may deliver this sync (warm) or async
        // (cold), so we don't know whether the view exists yet.
        this.heroDataReady = true;
        this.setupHeroSwiper();
      });
  }

  // Build the hero Swiper exactly once, only after BOTH the view is ready and
  // the slider data has resolved. This avoids the init-with-fallback then
  // destroy/recreate dance that raced differently on refresh vs. navigation.
  private setupHeroSwiper() {
    if (this.heroInitDone || !this.viewInitialized || !this.heroDataReady) {
      return;
    }
    this.heroInitDone = true;
    // Defer so Angular has rendered the *ngFor slides before Swiper measures.
    setTimeout(() => this.initHeroSwiper());
  }

  private initHeroSwiper() {
    this.swiperInstance?.destroy(true, true);
    this.swiperInstance = new Swiper('.slider-active-3', {
      slidesPerView: 1,
      spaceBetween: 0,
      loop: false,
      effect: 'fade',
      observer: true,
      observeParents: true,
      modules: [Pagination, EffectFade],
      pagination: {
        clickable: true,
        el: '.tp-slider-dot',
      },
    });
    // Swiper has laid out the slides synchronously — drop the shimmer overlay.
    this.heroReady = true;
  }

  // client logos
  public client_logos: string[] = [
    '/assets/img/client/hmt.png',
    '/assets/img/client/seiko.png',
    '/assets/img/client/timex.png',
    '/assets/img/client/casio.png',
    '/assets/img/client/titoni.png',
    '/assets/img/client/citizen.png',
  ];

  ngAfterViewInit() {
    this.viewInitialized = true;
    if (this.heroSliderContainer) {
      this.setupHeroSwiper();
    }

    this.setupProductSwiper();

    this.setupBlogSwiper();

    if (this.brandSliderContainer) {
      this.brandSliderInstance = new Swiper('.brand__slider-active', {
        slidesPerView: 5,
        spaceBetween: 30,
        breakpoints: {
          '1200': {
            slidesPerView: 5,
          },
          '992': {
            slidesPerView: 3,
          },
          '768': {
            slidesPerView: 2,
          },
          '576': {
            slidesPerView: 2,
          },
          '0': {
            slidesPerView: 1,
          },
        },
      });
    }
  }
}
