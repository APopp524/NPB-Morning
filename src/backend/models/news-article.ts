/**
 * News Article model types
 */

export interface NewsArticle {
  id: string;
  title: string;
  link: string;
  sourceName: string | null;
  sourceIcon: string | null;
  thumbnail: string | null;
  thumbnailSmall: string | null;
  publishedAt: Date | null;
  teamId: string | null;
  fetchedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewsArticleInput {
  title: string;
  link: string;
  sourceName?: string | null;
  sourceIcon?: string | null;
  thumbnail?: string | null;
  thumbnailSmall?: string | null;
  publishedAt?: Date | null;
  teamId?: string | null;
}
