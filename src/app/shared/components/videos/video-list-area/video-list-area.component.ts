import { ViewportScroller } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ProductService } from 'src/app/shared/services/product.service';
import { YoutubeVideoService } from 'src/app/shared/services/youtube-video.service';
import { IYoutubeVideo } from 'src/app/shared/types/youtube-video-d-t';

// The videos page — the blog listing with videos in it. Same paging, same
// skeletons, same empty state; the cards open YouTube rather than a detail page,
// since videos have none. (The home page's strip is <app-videos-area>.)
@Component({
  selector: 'app-video-list-area',
  templateUrl: './video-list-area.component.html',
  styleUrls: ['./video-list-area.component.scss'],
})
export class VideoListAreaComponent implements OnInit, OnDestroy {
  @Input() video_2_col: boolean = false;
  @Input() video_3_col: boolean = false;

  public videos: IYoutubeVideo[] = [];
  public total: number = 0;
  public loading: boolean = false;
  public pageSize: number = 3;
  // Fixed-length array driving the loading skeleton's *ngFor. Held as a field
  // rather than built inline in the template, which would hand *ngFor a new
  // array on every change-detection pass.
  public skeletonSlots: number[] = [];
  public paginate: any = {}; // Pagination use only
  public pageNo: number = 1;

  private destroy$ = new Subject<void>();

  constructor(
    public productService: ProductService,
    private youtubeVideoService: YoutubeVideoService,
    private route: ActivatedRoute,
    private router: Router,
    private viewScroller: ViewportScroller,
  ) {}

  ngOnInit() {
    if (this.video_2_col) {
      this.pageSize = 4;
    }
    if (this.video_3_col) {
      this.pageSize = 6;
    }
    this.skeletonSlots = Array.from({ length: this.pageSize }, (_, i) => i);

    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.pageNo = params['page'] ? Number(params['page']) : 1;
        this.fetchVideos();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Pagination is server-side: the API returns just this page plus the overall
  // total, which is what getPager needs to build the page links.
  private fetchVideos() {
    this.loading = true;
    this.youtubeVideoService
      .list({ page: this.pageNo, limit: this.pageSize })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.loading = false)),
      )
      .subscribe({
        next: (res) => {
          this.videos = res?.items ?? [];
          this.total = res?.total ?? this.videos.length;
          this.paginate = this.total
            ? this.productService.getPager(this.total, this.pageNo, this.pageSize)
            : {};
        },
        error: () => {
          this.videos = [];
          this.total = 0;
          this.paginate = {};
        },
      });
  }

  setPage(page: number) {
    this.router
      .navigate([], {
        relativeTo: this.route,
        queryParams: { page: page },
        queryParamsHandling: 'merge',
        skipLocationChange: false,
      })
      .finally(() => {
        this.viewScroller.setOffset([120, 120]);
      });
  }
}
