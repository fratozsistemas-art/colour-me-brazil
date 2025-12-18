// Utility to load and parse book manifest.json files

/**
 * Load a book manifest from the assets folder
 * @param {string} bookSlug - The book identifier (e.g., "tales-of-amazon")
 * @returns {Promise<Object>} The parsed manifest
 */
export async function loadBookManifest(bookSlug) {
  try {
    const response = await fetch(`/assets/books/${bookSlug}/manifest.json`);
    if (!response.ok) {
      throw new Error(`Failed to load manifest for ${bookSlug}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading book manifest:', error);
    throw error;
  }
}

/**
 * Get the full URL for a book asset
 * @param {string} bookSlug - The book identifier
 * @param {string} relativePath - Path relative to the book folder
 * @returns {string} Full asset URL
 */
export function getBookAssetUrl(bookSlug, relativePath) {
  return `/assets/books/${bookSlug}/${relativePath}`;
}

/**
 * Get story pages (text content pages)
 * @param {Object} manifest - The book manifest
 * @returns {Array} Array of story/text pages
 */
export function getStoryPages(manifest) {
  return manifest.pages.filter(page => page.kind === 'story' || page.kind === 'text');
}

/**
 * Get coloring pages
 * @param {Object} manifest - The book manifest
 * @returns {Array} Array of coloring pages
 */
export function getColoringPages(manifest) {
  return manifest.pages.filter(page => page.kind === 'coloring');
}

/**
 * Get a page by its ID
 * @param {Object} manifest - The book manifest
 * @param {string} pageId - The page ID
 * @returns {Object|null} The page object or null if not found
 */
export function getPageById(manifest, pageId) {
  return manifest.pages.find(page => page.pageId === pageId) || null;
}