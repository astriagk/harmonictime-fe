import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BlogService } from 'src/app/shared/services/blog.service';
import {
  IBlogCard,
  IBlogDetail,
  IBlogSection,
} from 'src/app/shared/types/blog-d-t';
import social_links, { ISocial } from 'src/app/shared/data/social-data';

@Component({
  selector: 'app-blog-details-area',
  templateUrl: './blog-details-area.component.html',
  styleUrls: ['./blog-details-area.component.scss']
})
export class BlogDetailsAreaComponent implements OnChanges {
  @Input() blog!:IBlogDetail;

  public related_blogs: IBlogCard[] = [];
  public social_links: ISocial[] = social_links;
  // The article's sections, with each one's HTML prepared for rendering.
  public sections: (IBlogSection & { Html: string })[] = [];

  constructor(private blogService: BlogService){}

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['blog'] || !this.blog) return;
    this.sections = (this.blog.Sections ?? []).map((section) => ({
      ...section,
      Html: this.toTemplateMarkup(section.Content),
    }));
    this.loadRelated();
  }

  /**
   * A section's text arrives as bare HTML with no classes, so the template's
   * `.postbox` styles can't reach a `<blockquote>`. Rebuild it into the exact
   * markup the static page used, and the global rules in `_blog.scss` apply as
   * they always did:
   *
   *   <blockquote> → <article class="postbox format-quote mt-45 mb-50">…
   *
   * Paragraphs need nothing — the `.postbox__text` wrapper already styles every
   * `p` inside it. Images are not part of a section's HTML; they are their own
   * field, rendered by the template.
   */
  private toTemplateMarkup(html?: string): string {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');

    doc.querySelectorAll('blockquote').forEach((quote) => {
      // Quill emits a bare <blockquote>, but a pasted one may wrap its text in
      // <p>; strip those so we don't nest a <p> inside the template's own.
      const inner = quote.innerHTML.replace(/<\/?p[^>]*>/gi, ' ').trim();
      const article = doc.createElement('article');
      article.className = 'postbox format-quote mt-45 mb-50';
      article.innerHTML =
        '<div class="postbox__quote"><blockquote><p>' +
        '<i class="fas fa-quote-right"></i> ' +
        inner +
        '</p></blockquote></div>';
      quote.replaceWith(article);
    });

    return doc.body.innerHTML;
  }

  public get heroImage(): string {
    return this.blog?.Image || '';
  }

  public linkFor(blog: IBlogCard): string {
    return blog?.Slug || blog?._id;
  }

  // Related posts are a nice-to-have; a failure here must not break the article.
  private loadRelated(): void {
    const slugOrId = this.blog?.Slug || this.blog?._id;
    if (!slugOrId) return;
    this.blogService.related(slugOrId).subscribe({
      next: (blogs) => (this.related_blogs = (blogs ?? []).slice(0, 3)),
      error: () => (this.related_blogs = []),
    });
  }

  // Share the current post. X and LinkedIn have web share endpoints; Instagram
  // has none, so it goes through the device share sheet (which hands the link
  // to the installed app) and falls back to opening Instagram in a new tab.
  public shareTo(item: ISocial): void {
    const url = window.location.href;
    const text = this.blog?.Title ?? '';

    switch (item.name) {
      case 'X':
        this.openShareWindow(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
        );
        break;
      case 'LinkedIn':
        this.openShareWindow(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
        );
        break;
      default:
        this.shareNative(url, text, item);
    }
  }

  private openShareWindow(shareUrl: string): void {
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=600');
  }

  private shareNative(url: string, text: string, item: ISocial): void {
    if (navigator.share) {
      navigator
        .share({ title: text, text, url })
        .catch(() => {}); // user dismissed the sheet
      return;
    }

    navigator.clipboard?.writeText(url);
    window.open(item.link, '_blank', 'noopener,noreferrer');
  }

}
