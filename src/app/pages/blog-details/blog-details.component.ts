import { Component } from '@angular/core';
import { BlogService } from 'src/app/shared/services/blog.service';
import { IBlogDetail } from 'src/app/shared/types/blog-d-t';

/**
 * `/pages/blog-details` with no slug — the template's original "latest post"
 * page. It used to render `blog_data[0]` from the static fixtures; now it looks
 * up the newest published post and renders that. Kept as-is so the route keeps
 * working; the slug-addressed page is `BlogDynamicDetailsComponent`.
 */
@Component({
  selector: 'app-blog-details',
  templateUrl: './blog-details.component.html',
  styleUrls: ['./blog-details.component.scss']
})
export class BlogDetailsComponent {
  public blog: IBlogDetail | null = null;
  public loading = true;

  constructor(private blogService: BlogService){
    // The list endpoint returns newest first, so page 1 / limit 1 is the latest
    // post. It only carries card fields, so fetch the full post by its slug.
    this.blogService.list({ page: 1, limit: 1 }).subscribe({
      next: (res) => {
        const latest = res?.items?.[0];
        if (!latest) {
          this.loading = false;
          return;
        }
        this.blogService.getBySlug(latest.Slug || latest._id).subscribe({
          next: (blog) => {
            this.blog = blog;
            this.loading = false;
          },
          error: () => (this.loading = false),
        });
      },
      error: () => (this.loading = false),
    });
  }
}
