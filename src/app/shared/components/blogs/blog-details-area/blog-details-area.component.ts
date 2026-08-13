import { Component, Input } from '@angular/core';
import { UtilsService } from 'src/app/shared/services/utils.service';
import IBlogType from 'src/app/shared/types/blog-d-t';
import social_links, { ISocial } from 'src/app/shared/data/social-data';

@Component({
  selector: 'app-blog-details-area',
  templateUrl: './blog-details-area.component.html',
  styleUrls: ['./blog-details-area.component.scss']
})
export class BlogDetailsAreaComponent {
  @Input() blog!:IBlogType;

  public related_blogs: IBlogType[] = [];
  public social_links: ISocial[] = social_links;

  constructor(public utilsService:UtilsService){
    this.utilsService.blogs.subscribe((blogs) => {
      this.related_blogs = blogs.slice(0,2)
    });
  }

  // Share the current post. X and LinkedIn have web share endpoints; Instagram
  // has none, so it goes through the device share sheet (which hands the link
  // to the installed app) and falls back to opening Instagram in a new tab.
  public shareTo(item: ISocial): void {
    const url = window.location.href;
    const text = this.blog?.title ?? '';

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
