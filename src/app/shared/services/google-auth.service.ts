import { Injectable, NgZone } from '@angular/core';
import { environment } from '@env/environment';

declare const google: any;

/**
 * Thin wrapper over Google Identity Services (the `gsi/client` script loaded in
 * index.html). Nothing else in the app should touch `window.google`.
 *
 * Two things this exists to hide:
 *  - the script is `async defer`, so `google` may not be defined yet when a
 *    component initialises. `ready()` resolves once it is.
 *  - `google.accounts.id.initialize()` is global, not per-button, and calling it
 *    twice re-registers the callback. It is done once, lazily, here.
 */
@Injectable({ providedIn: 'root' })
export class GoogleAuthService {
  private readyPromise?: Promise<boolean>;
  private initialized = false;

  /** Fires with the Google ID token whenever a sign-in completes. */
  private onCredential?: (idToken: string) => void;

  constructor(private ngZone: NgZone) {}

  /** True when a client ID has been configured — lets callers hide the button. */
  get isConfigured(): boolean {
    const id = environment.googleClientId;
    return !!id && !id.startsWith('REPLACE_ME');
  }

  /**
   * Resolves true once the GSI script is available, false if it never loads
   * (offline, blocked by an extension, or Google is unreachable) so callers can
   * degrade to email/password instead of hanging.
   */
  ready(timeoutMs = 10000): Promise<boolean> {
    if (this.readyPromise) return this.readyPromise;

    this.readyPromise = new Promise<boolean>((resolve) => {
      // Polled outside Angular — a 100ms interval would otherwise trigger change
      // detection for the life of the page.
      this.ngZone.runOutsideAngular(() => {
        const startedAt = Date.now();
        const poll = () => {
          if (typeof google !== 'undefined' && google?.accounts?.id) {
            resolve(true);
          } else if (Date.now() - startedAt > timeoutMs) {
            resolve(false);
          } else {
            setTimeout(poll, 100);
          }
        };
        poll();
      });
    });

    return this.readyPromise;
  }

  /**
   * Renders Google's own button into `container`. Google requires their branded
   * button (or an equivalent that follows their guidelines), and it handles the
   * popup, localisation and accessibility for us.
   *
   * `onCredential` is re-assigned on every call so the most recently rendered
   * button on the page owns the callback — the auth pages only show one.
   */
  async renderButton(
    container: HTMLElement,
    onCredential: (idToken: string) => void,
    options: Record<string, unknown> = {},
  ): Promise<boolean> {
    if (!this.isConfigured) return false;
    if (!(await this.ready())) return false;

    this.onCredential = onCredential;

    if (!this.initialized) {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        // The GSI callback fires outside Angular's zone; without ngZone.run the
        // resulting state change never triggers change detection.
        callback: (response: { credential: string }) =>
          this.ngZone.run(() => this.onCredential?.(response.credential)),
        ux_mode: 'popup',
        auto_select: false,
        // Don't let a failed/cancelled attempt suppress the prompt for a day.
        itp_support: true,
      });
      this.initialized = true;
    }

    google.accounts.id.renderButton(container, {
      theme: 'outline',
      size: 'large',
      shape: 'rectangular',
      logo_alignment: 'center',
      text: 'continue_with',
      ...options,
    });

    return true;
  }

  /**
   * Clears GSI's "recently signed in" state. Called on logout so the next
   * sign-in shows the account chooser instead of silently reusing the last one.
   */
  disableAutoSelect(): void {
    if (typeof google !== 'undefined' && google?.accounts?.id) {
      google.accounts.id.disableAutoSelect();
    }
  }
}
