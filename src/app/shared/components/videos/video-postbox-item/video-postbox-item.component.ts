import { Component, Input } from '@angular/core';
import { IYoutubeVideo } from 'src/app/shared/types/youtube-video-d-t';
import { defaultThumbnail } from 'src/app/shared/utils/youtube';

// One card on the videos page — the blog postbox item with a still in place of
// the cover. There is no detail page to link to, so the thumbnail, the title
// and the button all open the video on YouTube in a new tab.
@Component({
  selector: 'app-video-postbox-item',
  templateUrl: './video-postbox-item.component.html',
  styleUrls: ['./video-postbox-item.component.scss'],
})
export class VideoPostboxItemComponent {
  @Input() video!: IYoutubeVideo;
  @Input() cls?: string;
  @Input() title_cls: boolean = true;

  // Prefer the stored URL — it keeps any timestamp the admin pasted — and fall
  // back to one built from the id.
  get watchUrl(): string {
    return (
      this.video?.YoutubeUrl ||
      `https://www.youtube.com/watch?v=${this.video?.VideoId}`
    );
  }

  // The API derives Thumbnail from VideoId, but an admin can override it with a
  // URL that later 404s — fall back to YouTube's own still either way.
  get thumbnail(): string {
    return this.video?.Thumbnail || defaultThumbnail(this.video?.VideoId);
  }

  // `video-post__*` rather than `video__*`: the theme already owns the
  // `.video` block (_banner.scss), where `__content` is absolutely positioned
  // for the full-width CMS video banner.
  getClass() {
    let dynamicClass = '';
    if (this.cls) {
      dynamicClass = this.cls;
    } else {
      dynamicClass = 'video-post__border-bottom mb-30 pb-60';
    }
    return dynamicClass;
  }
}
