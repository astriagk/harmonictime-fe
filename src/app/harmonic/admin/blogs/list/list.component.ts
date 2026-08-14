import { ViewportScroller } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { BlogService } from 'src/app/shared/services/blog.service';
import { ProductService } from 'src/app/shared/services/product.service';
import { BlogStatus, IBlogAdminCard } from 'src/app/shared/types/blog-d-t';
import {
  loadAdminBlogs,
  reloadAdminBlogs,
} from 'src/app/store/actions/admin-blogs.actions';
import {
  selectAdminBlogs,
  selectAdminBlogsLoading,
  selectAdminBlogsTotal,
} from 'src/app/store/selectors/admin-blogs.selectors';

type BlogFilter = BlogStatus | '';

@Component({
  selector: 'app-admin-blogs',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class AdminBlogsComponent implements OnInit, OnDestroy {
  blogs: IBlogAdminCard[] = []; // the current page, straight from the API
  total = 0;
  paginate: any = {};
  pageSize = 10;
  pageNo = 1;
  loading = false;

  activeFilter: BlogFilter = '';
  filters: { label: string; value: BlogFilter }[] = [
    { label: 'All', value: '' },
    { label: 'Published', value: 'published' },
    { label: 'Drafts', value: 'draft' },
    { label: 'Archived', value: 'archived' },
  ];

  isArchiving: string | null = null;
  confirmArchiveId: string | null = null;
  confirmArchiveName = '';

  private destroy$ = new Subject<void>();

  constructor(
    private blogService: BlogService,
    private toastr: ToastrService,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    private viewScroller: ViewportScroller,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.store
      .select(selectAdminBlogsLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => (this.loading = loading));

    this.store
      .select(selectAdminBlogsTotal)
      .pipe(takeUntil(this.destroy$))
      .subscribe((total) => {
        this.total = total;
        this.buildPager();
      });

    this.store
      .select(selectAdminBlogs)
      .pipe(takeUntil(this.destroy$))
      .subscribe((items) => (this.blogs = items));

    // Page and status both live in the URL, so a refresh or a back button lands
    // the admin on the same view.
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.pageNo = params['page'] ? Number(params['page']) : 1;
        this.activeFilter = (params['status'] as BlogFilter) ?? '';
        this.fetch();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private fetch(): void {
    this.store.dispatch(
      loadAdminBlogs({
        query: {
          page: this.pageNo,
          limit: this.pageSize,
          status: this.activeFilter,
        },
      })
    );
  }

  private buildPager(): void {
    this.paginate = this.total
      ? this.productService.getPager(this.total, this.pageNo, this.pageSize)
      : {};
  }

  setFilter(filter: BlogFilter): void {
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

  requestArchive(blog: IBlogAdminCard): void {
    this.confirmArchiveId = blog._id;
    this.confirmArchiveName = blog.Title;
  }

  cancelArchive(): void {
    this.confirmArchiveId = null;
    this.confirmArchiveName = '';
  }

  confirmArchive(): void {
    const id = this.confirmArchiveId;
    if (!id) return;
    this.isArchiving = id;
    this.cancelArchive();
    this.blogService
      .archive(id)
      .pipe(finalize(() => (this.isArchiving = null)))
      .subscribe({
        next: () => {
          this.toastr.success('Blog post archived');
          this.store.dispatch(reloadAdminBlogs());
        },
        error: (err) =>
          this.toastr.error(err?.error?.message ?? 'Failed to archive blog post'),
      });
  }

  // The public detail page resolves by slug, falling back to the id.
  publicUrl(blog: IBlogAdminCard): string {
    return `/pages/blog-details/${blog.Slug || blog._id}`;
  }

  // Reuse the shared .admin-status-badge variants (_admin.scss) rather than
  // adding blog-specific ones: published reads green like 'active', drafts
  // amber like 'pending', archived grey like an unverified seller.
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
