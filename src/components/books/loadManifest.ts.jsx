import type { BookManifest } from "./bookTypes";

export async function loadBookManifest(bookId: string): Promise<BookManifest> {
  const res = await fetch(`/assets/books/${bookId}/manifest.json`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Manifest not found for book: ${bookId}`);
  return (await res.json()) as BookManifest;
}

export async function getPageImageUrl(manifest: BookManifest, pageId: string): string | null {
  const page = manifest.pages.find(p => p.id === pageId);
  if (!page) return null;
  return `${manifest.basePath}/${page.file}`;
}