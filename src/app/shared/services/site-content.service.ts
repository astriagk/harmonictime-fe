import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { GET_SITE_CONTENT } from '@config/index';
import { GenericService } from './generic.service';

/**
 * Fetches the CMS-managed site content (/site-content) once and caches it,
 * so every consumer (hero slider, category banner, …) shares a single call.
 * Each block is keyed by `type`; `getBlock(type)` returns that block's `data`.
 */
@Injectable({
  providedIn: 'root',
})
export class SiteContentService {
  private content$?: Observable<any[]>;

  constructor(private genericService: GenericService) {}

  private getContent(): Observable<any[]> {
    if (!this.content$) {
      this.content$ = this.genericService.getObservable(GET_SITE_CONTENT).pipe(
        map((res) => res?.data || []),
        catchError(() => of([])),
        shareReplay(1)
      );
    }
    return this.content$;
  }

  // Active block's `data` array for the given type, or [] when absent.
  getBlock<T>(type: string): Observable<T[]> {
    return this.getContent().pipe(
      map((blocks) => {
        const block = blocks.find((b: any) => b.type === type && b.isActive);
        return (block?.data || []) as T[];
      })
    );
  }
}
