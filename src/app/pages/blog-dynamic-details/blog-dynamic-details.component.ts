import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, of } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { BlogService } from 'src/app/shared/services/blog.service';
import { SeoService } from 'src/app/shared/services/seo.service';
import { IBlogDetail } from 'src/app/shared/types/blog-d-t';

@Component({
  selector: 'app-blog-dynamic-details',
  templateUrl: './blog-dynamic-details.component.html',
  styleUrls: ['./blog-dynamic-details.component.scss']
})
export class BlogDynamicDetailsComponent {

  public blog: IBlogDetail | null = null;
  public loading = true;
  // 410: the post existed and was archived. Worth saying so rather than
  // pretending the URL never meant anything.
  public gone = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService,
    private seoService: SeoService,
    private router: Router
  ) {}

  ngOnInit() {
    // The route param is the slug for new posts and the mongo id for older
    // links; the API accepts either.
    this.route.paramMap.pipe(
      takeUntil(this.destroy$),
      switchMap(params => {
        const slugOrId = params.get('slug');
        if (!slugOrId) {
          this.router.navigate(['/404']);
          return of(null);
        }
        this.loading = true;
        this.gone = false;
        return this.blogService.getBySlug(slugOrId);
      })
    ).subscribe({
      next: (blog) => {
        this.loading = false;
        if (!blog) return;
        this.blog = blog;
        this.applySeo(blog);
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        if (err.status === 410) {
          this.gone = true;
          // An archived article should not be indexed or re-shared.
          this.seoService.update({
            title: 'Article Removed',
            description: 'This article is no longer available.',
            noIndex: true,
          });
          return;
        }
        this.router.navigate(['/404']);
      },
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // The banner shows the category, not the title. The full title is the <h1>
  // immediately below it, so repeating it here was duplication — and a long one
  // overflowed the banner into the breadcrumb trail beside it. A category is
  // always short, which keeps the banner one line for every post.
  get breadcrumbTitle(): string {
    if (this.gone) return 'Article Removed';
    return this.blog?.Category || 'Blog Details';
  }

  private applySeo(blog: IBlogDetail) {
    this.seoService.update({
      title: blog.Seo?.MetaTitle || blog.Title,
      description: blog.Seo?.MetaDescription || blog.Excerpt,
      image: blog.Image,
      type: 'article',
    });
  }

}
