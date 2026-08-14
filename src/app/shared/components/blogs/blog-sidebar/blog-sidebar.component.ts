import { Component, OnInit } from '@angular/core';
import { BlogService } from 'src/app/shared/services/blog.service';
import { IBlogCard } from 'src/app/shared/types/blog-d-t';

@Component({
  selector: 'app-blog-sidebar',
  templateUrl: './blog-sidebar.component.html',
  styleUrls: ['./blog-sidebar.component.scss']
})
export class BlogSidebarComponent implements OnInit {

  public recent_blogs: IBlogCard[] = [];

  constructor(private blogService: BlogService){}

  ngOnInit(): void {
    // The list endpoint returns newest first, so page 1 is the latest posts.
    this.blogService.list({ page: 1, limit: 3 }).subscribe({
      next: (res) => (this.recent_blogs = res?.items ?? []),
      error: () => (this.recent_blogs = []),
    });
  }

  public linkFor(blog: IBlogCard): string {
    return blog?.Slug || blog?._id;
  }

}
