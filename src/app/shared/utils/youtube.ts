// Helpers for the YouTube video blocks (spec/youtube-videos-api.md).
// The API accepts a watch URL, a youtu.be link, an embed or shorts URL, or a
// bare 11-character id, and derives `VideoId`/`Thumbnail` from it. The admin
// form parses the same shapes client-side so a bad link is caught before the
// round trip, and so the thumbnail preview can be shown while typing.

/** The video id inside any accepted link shape, or null if there isn't one. */
export function extractVideoId(value: string | null | undefined): string | null {
  const input = (value ?? '').trim();
  if (!input) return null;

  // A bare id: exactly 11 characters of YouTube's alphabet.
  if (/^[A-Za-z0-9_-]{11}$/.test(input)) return input;

  const patterns = [
    /[?&]v=([A-Za-z0-9_-]{11})/, // watch?v=…
    /youtu\.be\/([A-Za-z0-9_-]{11})/, // youtu.be/…
    /\/embed\/([A-Za-z0-9_-]{11})/, // /embed/…
    /\/shorts\/([A-Za-z0-9_-]{11})/, // /shorts/…
    /\/live\/([A-Za-z0-9_-]{11})/, // /live/…
  ];
  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/** YouTube's own still for a video id — the thumbnail the API defaults to. */
export function defaultThumbnail(videoId: string | null | undefined): string {
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
}
