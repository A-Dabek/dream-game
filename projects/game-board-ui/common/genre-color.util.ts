import { Genre } from '@dream/item';

/**
 * Maps a genre to its corresponding CSS variable color.
 * Returns 'currentColor' for undefined/null genres (e.g., pass actions).
 */
export function getGenreColor(genre: Genre | undefined): string {
  if (!genre) return 'currentColor';

  const colorMap: Record<Genre, string> = {
    basic: 'var(--genre-basic)',
  };

  return colorMap[genre] ?? 'currentColor';
}
