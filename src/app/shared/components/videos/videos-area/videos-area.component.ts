import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { finalize } from 'rxjs/operators';
import Swiper from 'swiper';
import { YoutubeVideoService } from 'src/app/shared/services/youtube-video.service';
import { UtilsService } from 'src/app/shared/services/utils.service';
import { IYoutubeVideo } from 'src/app/shared/types/youtube-video-d-t';
import { defaultThumbnail } from 'src/app/shared/utils/youtube';

// The home page's video strip — the same slider the blog strip uses, with a
// thumbnail in place of the cover image. There is no detail page: a slide opens
// the embed in the shared <app-video-popup>, so the host page must render that
// component once (home-seven already does).
@Component({
  selector: 'app-videos-area',
  templateUrl: './videos-area.component.html',
  styleUrls: ['./videos-area.component.scss'],
})
export class VideosAreaComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('videoSliderContainer') videoSliderContainer!: ElementRef;

  // First page only: the home page shows a fixed strip, not a paged list.
  @Input() limit = 8;
  // Deliberately generic — the strip carries whatever the channel posts, not
  // one kind of film. Styled with the page-wide `.section__title-2`, like the
  // bestseller and featured headings.
  @Input() sectionTitle = 'FROM OUR CHANNEL';
  // Lets the host swap in its own fallback block when nothing comes back —
  // emits the item count once the request settles.
  @Output() loaded = new EventEmitter<number>();

  videos: IYoutubeVideo[] = [];
  loading = true;

  public sliderInstance: Swiper | undefined;

  // Fixed-length array backing the skeleton's *ngFor, held as a field so
  // change detection isn't handed a new array on every pass. Two slots, matching
  // the two slides the slider shows at desktop width.
  skeletonSlots: number[] = [0, 1];

  private viewInitialized = false;
  private dataReady = false;
  private sliderInitDone = false;

  constructor(
    private youtubeVideoService: YoutubeVideoService,
    public utilsService: UtilsService,
  ) {}

  ngOnInit(): void {
    this.youtubeVideoService
      .list({ page: 1, limit: this.limit })
      .pipe(
        finalize(() => {
          // Flip the shimmer off first: the slider markup sits behind
          // `loading`, so it can't be measured before this runs.
          this.loading = false;
          this.dataReady = true;
          this.loaded.emit(this.videos.length);
          this.setupSwiper();
        }),
      )
      .subscribe({
        next: (res) => (this.videos = res?.items ?? []),
        error: () => (this.videos = []),
      });
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    this.setupSwiper();
  }

  ngOnDestroy(): void {
    this.sliderInstance?.destroy(true, true);
  }

  // Same two-gate init as the home page's own sliders: the view must exist and
  // the videos must have resolved before Swiper measures the slides, and only
  // ever once.
  private setupSwiper(): void {
    if (
      this.sliderInitDone ||
      !this.viewInitialized ||
      !this.dataReady ||
      !this.videos.length
    ) {
      return;
    }
    this.sliderInitDone = true;
    // Defer so Angular has rendered the *ngFor slides before Swiper measures.
    setTimeout(() => this.initSwiper());
  }

  private initSwiper(): void {
    this.sliderInstance?.destroy(true, true);
    // Built from the element rather than a selector string: the component can
    // appear on more than one page, and a selector would always find the first.
    this.sliderInstance = new Swiper(this.videoSliderContainer.nativeElement, {
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

  // The API derives Thumbnail from VideoId, but an admin can override it with a
  // URL that later 404s — fall back to YouTube's own still either way.
  thumbnail(video: IYoutubeVideo): string {
    return video?.Thumbnail || defaultThumbnail(video?.VideoId);
  }

  play(video: IYoutubeVideo): void {
    if (!video?.VideoId) return;
    this.utilsService.playVideo(video.VideoId);
  }
}
