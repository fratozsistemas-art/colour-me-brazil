/**
 * Load book manifest from local assets and normalize its structure
 * @param {string} bookId 
 * @returns {Promise<Object>} Normalized manifest with proper field mappings
 */
export async function loadBookManifest(bookId) {
  const res = await fetch(`/assets/books/${bookId}/manifest.json`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Manifest not found for book: ${bookId}`);
  const rawManifest = await res.json();
  
  // Normalize the manifest structure
  const normalized = {
    id: rawManifest.book.id,
    title: rawManifest.book.title,
    author: rawManifest.book.author,
    language: rawManifest.book.language || 'en',
    basePath: `/${rawManifest.assets.basePath}`,
    pages: rawManifest.pages.map((page, index) => ({
      id: page.id,
      order: index,
      // Map 'kind' to 'type' and normalize values
      type: normalizePageType(page.kind),
      kind: page.kind, // Keep original for reference
      label: page.title || `Page ${index + 1}`,
      title: page.title,
      subtitle: page.subtitle,
      text: page.text, // Array of text paragraphs
      backgroundColor: page.backgroundColor,
      // Image paths
      image: page.image || page.imageFallback,
      lineArtImage: page.lineArtImage,
      thumb: page.thumb,
      // Additional metadata
      legendId: page.legendId,
      pairedWith: page.pairedWith
    }))
  };
  
  return normalized;
}

/**
 * Normalize page kind to type for component compatibility
 * @param {string} kind - Original page kind from manifest
 * @returns {string} Normalized type
 */
function normalizePageType(kind) {
  const typeMap = {
    'cover': 'text',
    'text': 'text',
    'story': 'text',
    'coloring': 'color',
    'credits': 'text'
  };
  return typeMap[kind] || 'text';
}

/**
 * Get full image URL for a page
 * @param {Object} manifest - Normalized manifest
 * @param {string} pageId 
 * @returns {string | null}
 */
export function getPageImageUrl(manifest, pageId) {
  const page = manifest.pages.find(p => p.id === pageId);
  if (!page) return null;
  
  // For coloring pages, prefer lineArtImage, otherwise use regular image
  const imagePath = page.lineArtImage || page.image;
  if (!imagePath) return null;
  
  return `${manifest.basePath}/${imagePath}`;
}