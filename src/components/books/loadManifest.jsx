/**
 * Load book manifest from local assets
 * @param {string} bookId 
 * @returns {Promise<import('./bookTypes').BookManifest>}
 */
export async function loadBookManifest(bookId) {
  const res = await fetch(`/assets/books/${bookId}/manifest.json`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Manifest not found for book: ${bookId}`);
  return await res.json();
}

/**
 * Get full image URL for a page
 * @param {import('./bookTypes').BookManifest} manifest 
 * @param {string} pageId 
 * @returns {string | null}
 */
export function getPageImageUrl(manifest, pageId) {
  const page = manifest.pages.find(p => p.id === pageId);
  if (!page) return null;
  return `${manifest.basePath}/${page.file}`;
}