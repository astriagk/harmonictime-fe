import { Inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { environment } from 'src/environments/environment';

/**
 * What a page wants its head to say. Every field is optional — anything left
 * out falls back to the site default, so a route can override just the title.
 */
export interface SeoTags {
  title?: string;
  description?: string;
  /** Absolute URL, or a path like `/buyer/products` which is resolved against siteUrl. */
  url?: string;
  /** Absolute URL, or an asset path like `assets/logo/logo.png`. */
  image?: string;
  /** `website` for listings and static pages, `product` for a product page. */
  type?: 'website' | 'product' | 'article';
  /** Set on pages that must never be indexed (cart, checkout, account…). */
  noIndex?: boolean;
}

const SITE_NAME = 'Krono²';
const DEFAULT_TITLE =
  'Krono2 — Buy Premium Pre-Owned & Vintage Watches Online | Krono²';
const DEFAULT_DESCRIPTION =
  'Krono2 (Krono²) — a curated marketplace for authentic pre-owned and vintage luxury watches. Verified sellers, secure payments and pan-India delivery.';
const DEFAULT_IMAGE = 'assets/logo/logo.png';

/** Google truncates around 160; keep descriptions inside that. */
const MAX_DESCRIPTION = 160;

/**
 * Single owner of the document head. The app is client-rendered, so these tags
 * are written after boot — crawlers that execute JS pick them up, and the
 * static defaults in index.html cover the ones that don't. When SSR lands this
 * service keeps working unchanged; the tags simply arrive in the HTML.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  constructor(
    private title: Title,
    private meta: Meta,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  /** Apply a page's tags, filling every gap with the site default. */
  update(tags: SeoTags = {}): void {
    const title = tags.title ? `${tags.title} | ${SITE_NAME}` : DEFAULT_TITLE;
    const description = this.truncate(tags.description || DEFAULT_DESCRIPTION);
    const url = this.absolute(tags.url ?? this.document.location.pathname);
    const image = this.absolute(tags.image || DEFAULT_IMAGE);
    const type = tags.type ?? 'website';

    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({
      name: 'robots',
      content: tags.noIndex ? 'noindex, nofollow' : 'index, follow',
    });

    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:type', content: type });
    this.meta.updateTag({ property: 'og:site_name', content: SITE_NAME });

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: image });

    // A noindex page should not nominate itself as a canonical target.
    if (tags.noIndex) {
      this.removeCanonical();
    } else {
      this.setCanonical(url);
    }
  }

  /**
   * Replace the page's Product JSON-LD block. Kept separate from `update` so a
   * product page can set its tags as soon as the route resolves and add the
   * structured data later, once the product has actually loaded.
   */
  setStructuredData(data: Record<string, unknown> | null): void {
    const id = 'page-structured-data';
    this.document.getElementById(id)?.remove();
    if (!data) return;

    const script = this.document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    this.document.head.appendChild(script);
  }

  /** Reset to the site defaults — used when leaving a page that set its own tags. */
  reset(): void {
    this.update();
    this.setStructuredData(null);
  }

  private setCanonical(url: string): void {
    let link = this.document.head.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private removeCanonical(): void {
    this.document.head.querySelector('link[rel="canonical"]')?.remove();
  }

  /** Resolve a path against the public origin; pass absolute URLs through. */
  private absolute(pathOrUrl: string): string {
    if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
    const base = environment.siteUrl.replace(/\/$/, '');
    const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
    return `${base}${path}`;
  }

  /**
   * Strip markup and trim to a whole word, so a snippet never ends mid-word.
   * Product descriptions come back as rich text, hence the tag stripping.
   */
  private truncate(text: string): string {
    const clean = text
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (clean.length <= MAX_DESCRIPTION) return clean;
    const cut = clean.slice(0, MAX_DESCRIPTION);
    const lastSpace = cut.lastIndexOf(' ');
    return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
  }
}
