import { Component, Input } from '@angular/core';
import { IBlogCard } from 'src/app/shared/types/blog-d-t';

@Component({
  selector: 'app-blog-postbox-item',
  templateUrl: './blog-postbox-item.component.html',
  styleUrls: ['./blog-postbox-item.component.scss'],
})
export class BlogPostboxItemComponent {
  @Input() blog!: IBlogCard;
  @Input() cls?: string;
  @Input() title_cls: boolean = true;

  // The detail route resolves by slug, falling back to the id for posts saved
  // before slugs existed.
  get blogLink(): string {
    return this.blog?.Slug || this.blog?._id;
  }

  getClass() {
    let dynamicClass = '';
    if (this.cls) {
      dynamicClass = this.cls;
    } else {
      dynamicClass = 'blog__border-bottom mb-30 pb-60';
    }
    return dynamicClass;
  }
}
