/**
 * Parser for Google News API responses from SerpApi.
 * 
 * The Google News API uses a different engine (google_news) and returns
 * a different response structure than the regular Google search API.
 * 
 * @see https://serpapi.com/google-news-api
 */

import type { NewsArticleInput } from '../../models/news-article';

/**
 * Raw news result from Google News API
 */
export interface GoogleNewsResult {
  position?: number;
  title?: string;
  link?: string;
  source?: {
    name?: string;
    icon?: string;
    authors?: string[];
  };
  thumbnail?: string;
  thumbnail_small?: string;
  date?: string;
  iso_date?: string;
}

/**
 * Google News API response structure
 */
export interface GoogleNewsApiResponse {
  news_results?: GoogleNewsResult[];
  search_metadata?: {
    id?: string;
  };
  search_parameters?: {
    q?: string;
  };
  error?: string;
}

/**
 * Parsed news result ready for database insertion
 */
export interface ParsedNewsArticle {
  title: string;
  link: string;
  sourceName: string | null;
  sourceIcon: string | null;
  thumbnail: string | null;
  thumbnailSmall: string | null;
  publishedAt: Date | null;
}

/**
 * Parse the Google News API response into NewsArticleInput objects.
 * 
 * @param response The raw API response
 * @param maxArticles Maximum number of articles to return (default: 10)
 * @returns Array of parsed news articles
 */
export function parseNewsFromResponse(
  response: GoogleNewsApiResponse,
  maxArticles: number = 10
): ParsedNewsArticle[] {
  // Check for API errors
  if (response.error) {
    throw new Error(`Google News API error: ${response.error}`);
  }

  const newsResults = response.news_results;
  
  // Return empty array if no results (not an error condition)
  if (!newsResults || !Array.isArray(newsResults)) {
    console.warn('[news][parser] No news_results found in response');
    return [];
  }

  const articles: ParsedNewsArticle[] = [];

  for (const result of newsResults) {
    // Skip if missing required fields
    if (!result.title || !result.link) {
      console.warn('[news][parser] Skipping result with missing title or link');
      continue;
    }

    // Parse the published date
    let publishedAt: Date | null = null;
    if (result.iso_date) {
      try {
        publishedAt = new Date(result.iso_date);
        // Validate the date
        if (isNaN(publishedAt.getTime())) {
          publishedAt = null;
        }
      } catch {
        publishedAt = null;
      }
    }

    articles.push({
      title: result.title,
      link: result.link,
      sourceName: result.source?.name ?? null,
      sourceIcon: result.source?.icon ?? null,
      thumbnail: result.thumbnail ?? null,
      thumbnailSmall: result.thumbnail_small ?? null,
      publishedAt,
    });

    // Stop if we've reached the max
    if (articles.length >= maxArticles) {
      break;
    }
  }

  return articles;
}

/**
 * Convert parsed news articles to NewsArticleInput format.
 */
export function toNewsArticleInputs(articles: ParsedNewsArticle[]): NewsArticleInput[] {
  return articles.map((article) => ({
    title: article.title,
    link: article.link,
    sourceName: article.sourceName,
    sourceIcon: article.sourceIcon,
    thumbnail: article.thumbnail,
    thumbnailSmall: article.thumbnailSmall,
    publishedAt: article.publishedAt,
  }));
}
