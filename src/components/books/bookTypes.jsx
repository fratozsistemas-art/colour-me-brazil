/**
 * @typedef {'text' | 'color'} PageType
 */

/**
 * @typedef {Object} BookPage
 * @property {string} id
 * @property {PageType} type
 * @property {number} order
 * @property {string} label
 * @property {string} file
 */

/**
 * @typedef {Object} BookManifest
 * @property {string} id
 * @property {string} title
 * @property {string} [author]
 * @property {string} [language]
 * @property {number} version
 * @property {string} basePath
 * @property {BookPage[]} pages
 */

export {};