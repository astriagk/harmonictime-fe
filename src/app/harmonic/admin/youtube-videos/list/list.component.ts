import { ViewportScroller } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ProductService } from 'src/app/shared/services/product.service';
import { YoutubeVideoService } from 'src/app/shared/services/youtube-video.service';
import {
  IYoutubeVideo,
  YoutubeVideoStatus,
} from 'src/app/shared/types/youtube-video-d-t';

type VideoFilter = YoutubeVideoStatus | '';

// Mirrors the blog admin list, minus the NgRx slice: the video list is a single
// small page fetched on demand, so a store would only add indirection.
@Component({
  selector: 'app-admin-youtube-videos',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class AdminYoutubeVideosComponent implements OnInit, OnDestroy {
  videos: IYoutubeVideo[] = []; // the current page, straight from the API
  total = 0;
  paginate: any = {};
  pageSize = 10;
  pageNo = 1;
  loading = false;

  activeFilter: VideoFilter = '';
  filters: { label: string; value: VideoFilter }[] = [
    { label: 'All', value: '' },
    { label: 'Published', value: 'published' },
    { label: 'Drafts', value: 'draft' },
    { label: 'Archived', value: 'archived' },
  ];

  isDeleting: string | null = null;
  // The confirmation modal covers both removals: archiving (reversible) and the
  // ?hard=true delete offered on already-archived rows.
  confirmId: string | null = null;
  confirmTitle = '';
  confirmHard = false;

  private destroy$ = new Subject<void>();

  constructor(
    private youtubeVideoService: YoutubeVideoService,
    private toastr: ToastrService,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    private viewScroller: ViewportScroller,
  ) {}

  ngOnInit(): void {
    // Page and status both live in the URL, so a refresh or a back button lands
    // the admin on the same view.
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.pageNo = params['page'] ? Number(params['page']) : 1;
        this.activeFilter = (params['status'] as VideoFilter) ?? '';
        this.fetch();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private fetch(): void {
    this.loading = true;
    this.youtubeVideoService
      .adminList({
        page: this.pageNo,
        limit: this.pageSize,
        status: this.activeFilter,
      })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.loading = false)),
      )
      .subscribe({
        next: (res) => {
          this.videos = res?.items ?? [];
          this.total = res?.total ?? 0;
          this.buildPager();
        },
        error: (err) => {
          this.videos = [];
          this.total = 0;
          this.buildPager();
          this.toastr.error(err?.error?.message ?? 'Failed to load videos');
        },
      });
  }

  private buildPager(): void {
    this.paginate = this.total
      ? this.productService.getPager(this.total, this.pageNo, this.pageSize)
      : {};
  }

  setFilter(filter: VideoFilter): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { status: filter || null, page: 1 },
      queryParamsHandling: 'merge',
    });
  }

  setPage(page: number): void {
    this.router
      .navigate([], {
        relativeTo: this.route,
        queryParams: { page },
        queryParamsHandling: 'merge',
      })
      .finally(() => this.viewScroller.setOffset([120, 120]));
  }

  requestRemove(video: IYoutubeVideo, hard = false): void {
    this.confirmId = video._id;
    this.confirmTitle = video.Title;
    this.confirmHard = hard;
  }

  cancelRemove(): void {
    this.confirmId = null;
    this.confirmTitle = '';
    this.confirmHard = false;
  }

  confirmRemove(): void {
    const id = this.confirmId;
    const hard = this.confirmHard;
    if (!id) return;
    this.isDeleting = id;
    this.cancelRemove();
    this.youtubeVideoService
      .archive(id, hard)
      .pipe(finalize(() => (this.isDeleting = null)))
      .subscribe({
        next: () => {
          this.toastr.success(hard ? 'Video deleted' : 'Video archived');
          this.fetch();
        },
        error: (err) =>
          this.toastr.error(
            err?.error?.message ??
              (hard ? 'Failed to delete video' : 'Failed to archive video'),
          ),
      });
  }

  watchUrl(video: IYoutubeVideo): string {
    return video.YoutubeUrl || `https://www.youtube.com/watch?v=${video.VideoId}`;
  }

  // Same shared .admin-status-badge variants the blog list uses: published reads
  // green like 'active', drafts amber like 'pending', archived grey.
  statusClass(status?: string): string {
    switch (status) {
      case 'draft':
        return 'admin-status-badge--pending';
      case 'archived':
        return 'admin-status-badge--seller-unverified';
      default:
        return 'admin-status-badge--active';
    }
  }
}
