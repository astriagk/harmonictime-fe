// YouTube video blocks — contract in spec/youtube-videos-api.md.
// A "video" here is just a link plus a thumbnail: there is no detail page, the
// home page grid opens the embed in the shared video popup.

export type YoutubeVideoStatus = 'draft' | 'published' | 'archived';

// One item of GET /api/youtube-videos (and of the admin list, which returns the
// same shape for every status).
export interface IYoutubeVideo {
  _id: string;
  Title: string;
  YoutubeUrl: string;
  VideoId: string; // 11-char id — feeds https://www.youtube.com/embed/{VideoId}
  Thumbnail: string; // derived server-side from VideoId unless overridden
  Order: number; // ascending; the strip keeps the server's order
  // Byline and date, shown under the title exactly like a blog card. Required
  // on both sides now, though the card still guards against a missing value:
  // blocks created before these fields existed have neither.
  Author: string;
  PublishedAt: string; // ISO 8601 — format in the UI, never pre-formatted
  Status: YoutubeVideoStatus;
  CreatedAt: string; // ISO 8601
  UpdatedAt: string;
}

export interface IYoutubeVideoListResponse {
  items: IYoutubeVideo[];
  total: number; // total matching videos, NOT items.length — feed getPager()
  page: number;
  limit: number;
}

// POST/PUT body. Everything but Title/YoutubeUrl is optional: a blank Thumbnail
// is auto-derived, a missing Order appends to the end, a missing Status is
// 'draft'. `_id`, `VideoId`, `CreatedAt` and `UpdatedAt` are the server's to
// set — never spread a form value straight in.
export interface IYoutubeVideoPayload {
  Title: string;
  YoutubeUrl: string;
  Thumbnail?: string;
  Order?: number;
  Author: string;
  PublishedAt: string; // ISO 8601
  Status?: YoutubeVideoStatus;
}

export type IYoutubeVideoUpdate = Partial<IYoutubeVideoPayload>;

export interface IYoutubeVideoQuery {
  page?: number;
  limit?: number;
  status?: YoutubeVideoStatus | ''; // admin list only
}
