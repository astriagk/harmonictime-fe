/**
 * Single place where a successful auth response is written to localStorage.
 *
 * Three endpoints hand back a session — `/auth/login`, `/auth/google` and
 * `/auth/confirm-email` — and they all return the same fields. Keeping the
 * writes here means a new sign-in route can't quietly forget one of them.
 *
 * Values are JSON-stringified because that is what everything reading them
 * expects: GenericService.tokenOptions() does JSON.parse on `token`.
 */
export interface SessionPayload {
  token?: string;
  refreshToken?: string;
  userId?: string;
  email?: string;
  accountType?: string;
  roles?: number[];
  /** Where the backend wants the user to land after signing in. */
  redirectTo?: string;
}

export function persistSession(data: SessionPayload | undefined | null): void {
  if (!data) return;

  const keys: (keyof SessionPayload)[] = [
    'token',
    'refreshToken',
    'userId',
    'email',
    'accountType',
    'roles',
  ];
  for (const key of keys) {
    if (data[key] !== undefined && data[key] !== null) {
      localStorage.setItem(key, JSON.stringify(data[key]));
    }
  }

  // Navigation itself is left to mergeGuestCartOnLogin$, which reads these two
  // flags — it also needs to merge the guest cart first, so it has to be the
  // one that navigates.
  if (data.redirectTo === '/auth/gst-onboarding') {
    localStorage.setItem('_pendingGstRedirect', 'true');
  } else if (data.redirectTo) {
    localStorage.setItem('_pendingRedirect', data.redirectTo);
  }
}
