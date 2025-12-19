export type PageType = "text" | "color";

export type BookPage = {
  id: string;
  type: PageType;
  order: number;
  label: string;
  file: string;
};

export type BookManifest = {
  id: string;
  title: string;
  author?: string;
  language?: string;
  version: number;
  basePath: string;
  pages: BookPage[];
};