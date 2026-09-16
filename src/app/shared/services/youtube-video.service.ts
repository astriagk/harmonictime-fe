import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  YOUTUBE_VIDEOS,
  YOUTUBE_VIDEOS_ADMIN,
  YOUTUBE_VIDEO_BY_ID,
} from '@config/index';
import { GenericService } from './generic.service';
import {
  IYoutubeVideo,
  IYoutubeVideoListResponse,
  IYoutubeVideoPayload,
  IYoutubeVideoQuery,
  IYoutubeVideoUpdate,
} from '../types/youtube-video-d-t';

const EMPTY_LIST: IYoutubeVideoListResponse = {
  items: [],
  total: 0,
  page: 1,
  limit: 0,
};

// YouTube video blocks — contract in spec/youtube-videos-api.md.
// Every response is { message, data }, so the payload always lives under .data.
// The public list goes out unauthenticated; admin calls use the *Token variants
// so GenericService attaches the Bearer header.
@Injectable({
  providedIn: 'root',
})
export class YoutubeVideoService {
  constructor(private genericService: GenericService) {}

  // ── Public ────────────────────────────────────────────────────────────────

  // Published videos only, in Order, paginated server-side.
  list(query: IYoutubeVideoQuery = {}): Observable<IYoutubeVideoListResponse> {
    return this.genericService
      .getObservable(`${YOUTUBE_VIDEOS}${this.toQueryString(query, 8)}`)
      .pipe(map((res: any) => res?.data ?? { ...EMPTY_LIST }));
  }

  // ── Admin ─────────────────────────────────────────────────────────────────

  // Includes drafts and archived blocks; pass `status` to narrow.
  adminList(
    query: IYoutubeVideoQuery = {},
  ): Observable<IYoutubeVideoListResponse> {
    return this.genericService
      .getObservableToken(`${YOUTUBE_VIDEOS_ADMIN}${this.toQueryString(query, 10)}`)
      .pipe(map((res: any) => res?.data ?? { ...EMPTY_LIST }));
  }

  create(payload: IYoutubeVideoPayload): Observable<IYoutubeVideo> {
    return this.genericService
      .postObservableToken(YOUTUBE_VIDEOS, payload)
      .pipe(map((res: any) => res?.data));
  }

  // Partial — sending YoutubeUrl without Thumbnail re-derives the thumbnail
  // from the new video.
  update(id: string, payload: IYoutubeVideoUpdate): Observable<IYoutubeVideo> {
    return this.genericService
      .putObservableToken(`${YOUTUBE_VIDEO_BY_ID}${id}`, payload)
      .pipe(map((res: any) => res?.data));
  }

  // Soft delete — the block moves to Status: 'archived' and drops out of the
  // public list. `hard` permanently removes the document instead.
  archive(id: string, hard = false): Observable<any> {
    const url = `${YOUTUBE_VIDEO_BY_ID}${id}${hard ? '?hard=true' : ''}`;
    return this.genericService.deleteObservableToken(url);
  }

  // There is no GET /:id in the contract, so the edit screen resolves a single
  // block out of the admin list. Pages are small (10 by default), so this walks
  // them rather than asking the server for a lookup it doesn't offer.
  getById(id: string): Observable<IYoutubeVideo | undefined> {
    return this.adminList({ page: 1, limit: 200 }).pipe(
      map((res) => res.items.find((v) => v._id === id)),
    );
  }

  private toQueryString(
    query: IYoutubeVideoQuery,
    defaultLimit: number,
  ): string {
    const params = new URLSearchParams({
      page: String(query.page ?? 1),
      limit: String(query.limit ?? defaultLimit),
    });
    if (query.status) params.set('Status', query.status);
    return `?${params.toString()}`;
  }
}
