import { Component, ElementRef, ViewChild } from '@angular/core';
import Swiper from 'swiper';
import { HeroSliderData } from 'src/app/shared/data/hero-slider-data';
import { IHeroSlider } from 'src/app/shared/types/hero-slider-t';
import { IVideoArea } from 'src/app/shared/types/video-area-t';
import { EffectFade, Pagination } from 'swiper/modules';
import { IProduct } from 'src/app/shared/types/product-d-t';
import { ProductService } from 'src/app/shared/services/product.service';
import IBlogType from 'src/app/shared/types/blog-d-t';
import blog_data from 'src/app/shared/data/blog-data';
import { UtilsService } from 'src/app/shared/services/utils.service';
import { SiteContentService } from 'src/app/shared/services/site-content.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-home-seven',
  templateUrl: './home-seven.component.html',
  styleUrls: ['./home-seven.component.scss'],
})
export class HomeSevenComponent {
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
  // Drives the hero shimmer overlay: true once Swiper has built the slider, so
  // we mask the stacked/unstyled slides during the cold CMS-load window.
  public heroReady = false;
  // Drives the video-area shimmer: true once the CMS `video_area` block has
  // resolved, so the static fallback isn't shown then swapped.
  public videoReady = false;

  public hero_slider_data: IHeroSlider[] = HeroSliderData.hero_slider_seven;
  public blog_items: IBlogType[] = blog_data.filter((b) => b.blog === 'home-7');

  // Static fallback until the CMS `video_area` block loads.
  public video_area: IVideoArea = {
    bgImg:
      'https://harmonic-time.s3.us-east-1.amazonaws.com/site-content/video_area/dadacacb-09fc-40a7-bde1-8f0c38f0e1bb-1779435991494',
    videoTitle: 'Art of Restoring',
    videoId: '8nsL3Uryv0U',
    description:
      '"Art of Restoring" celebrates the craftsmanship behind bringing vintage and pre-owned watches back to life with precision, care, and timeless passion.',
  };

  public big_item_1: IProduct | undefined;
  public big_item_2: IProduct | undefined;
  public trending_products: IProduct[] = [];
  public sm_best_prd: IProduct[] = [];

  constructor(
    private productService: ProductService,
    public utilsService: UtilsService,
    private siteContentService: SiteContentService,
  ) {
    this.productService.products.subscribe((products) => {
      const best_sale_prd = products.filter((p) => p.bestSeller);
      this.big_item_1 = best_sale_prd.filter((p) => p.big_img)[0];
      this.big_item_2 = best_sale_prd.filter((p) => p.big_img)[1];
      this.sm_best_prd = best_sale_prd.filter((p) => !p.big_img);
    });
  }

  ngOnInit() {
    this.loadHeroSlider();
    this.loadVideoArea();
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

    if (this.productSliderContainer) {
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

    if (this.blogSliderContainer) {
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
