import { ViewportScroller } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { BlogService } from 'src/app/shared/services/blog.service';
import { ProductService } from 'src/app/shared/services/product.service';
import { IBlogCard } from 'src/app/shared/types/blog-d-t';

@Component({
  selector: 'app-blog-area',
  templateUrl: './blog-area.component.html',
  styleUrls: ['./blog-area.component.scss']
})
export class BlogAreaComponent implements OnInit, OnDestroy {

  @Input() left_side:boolean = false;
  @Input() no_side:boolean = false;
  @Input() blog_2_col:boolean = false;
  @Input() blog_3_col:boolean = false;

  getClass() {
    let dynamicClass = '';
    if (this.no_side) {
      dynamicClass = 'col-xl-8 col-lg-8 offset-xl-2 offset-lg-2';
    } else {
      if (this.left_side) {
        dynamicClass = 'col-xl-9 col-lg-8';
      } else {
        dynamicClass = 'col-xl-8 col-lg-8';
      }
    }
    return dynamicClass;
  }

  public blogs: IBlogCard[] = [];
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
    private blogService: BlogService,
    private route: ActivatedRoute,
    private router: Router,
    private viewScroller: ViewportScroller
  ) {}

  ngOnInit() {
    if (this.blog_2_col) {
      this.pageSize = 4;
    }
    if (this.blog_3_col) {
      this.pageSize = 6;
    }
    this.skeletonSlots = Array.from({ length: this.pageSize }, (_, i) => i);

    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.pageNo = params['page'] ? Number(params['page']) : 1;
        this.fetchBlogs();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Pagination is server-side: the API returns just this page plus the overall
  // total, which is what getPager needs to build the page links.
  private fetchBlogs() {
    this.loading = true;
    this.blogService
      .list({ page: this.pageNo, limit: this.pageSize })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.loading = false))
      )
      .subscribe({
        next: (res) => {
          this.blogs = res?.items ?? [];
          this.total = res?.total ?? this.blogs.length;
          this.paginate = this.total
            ? this.productService.getPager(this.total, this.pageNo, this.pageSize)
            : {};
        },
        error: () => {
          this.blogs = [];
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
