import { createHash } from 'crypto';
import { getSupabaseClient } from './client';
import { NewsArticle, NewsArticleInput } from '../models/news-article';

/**
 * Generate a deterministic ID from the article link.
 * Uses SHA256 hash for idempotency.
 */
function generateArticleId(link: string): string {
  return createHash('sha256').update(link).digest('hex').substring(0, 32);
}

/**
 * Upsert a single news article.
 */
export async function upsertNewsArticle(input: NewsArticleInput): Promise<NewsArticle> {
  const supabase = getSupabaseClient();
  const id = generateArticleId(input.link);

  const { data, error } = await supabase
    .from('news_articles')
    .upsert(
      {
        id,
        title: input.title,
        link: input.link,
        source_name: input.sourceName ?? null,
        source_icon: input.sourceIcon ?? null,
        thumbnail: input.thumbnail ?? null,
        thumbnail_small: input.thumbnailSmall ?? null,
        published_at: input.publishedAt?.toISOString() ?? null,
        fetched_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'id',
      }
    )
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to upsert news article: ${error.message}`);
  }

  return mapRowToNewsArticle(data);
}

/**
 * Upsert multiple news articles in a single transaction.
 */
export async function upsertNewsArticles(inputs: NewsArticleInput[]): Promise<NewsArticle[]> {
  if (inputs.length === 0) {
    return [];
  }

  const supabase = getSupabaseClient();
  const now = new Date().toISOString();

  const rows = inputs.map((input) => ({
    id: generateArticleId(input.link),
    title: input.title,
    link: input.link,
    source_name: input.sourceName ?? null,
    source_icon: input.sourceIcon ?? null,
    thumbnail: input.thumbnail ?? null,
    thumbnail_small: input.thumbnailSmall ?? null,
    published_at: input.publishedAt?.toISOString() ?? null,
    fetched_at: now,
    updated_at: now,
  }));

  const { data, error } = await supabase
    .from('news_articles')
    .upsert(rows, {
      onConflict: 'id',
    })
    .select();

  if (error) {
    throw new Error(`Failed to upsert news articles: ${error.message}`);
  }

  if (!data) {
    return [];
  }

  return data.map(mapRowToNewsArticle);
}

/**
 * Get recent news articles.
 * @param limit Maximum number of articles to return (default: 5)
 * @param daysBack Number of days to look back (default: 7)
 */
export async function getRecentNewsArticles(
  limit: number = 5,
  daysBack: number = 7
): Promise<NewsArticle[]> {
  const supabase = getSupabaseClient();
  
  // Calculate the cutoff date
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);

  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .gte('fetched_at', cutoffDate.toISOString())
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch recent news articles: ${error.message}`);
  }

  if (!data) {
    return [];
  }

  return data.map(mapRowToNewsArticle);
}

/**
 * Delete news articles older than a specified number of days.
 * Used for cleanup to prevent table from growing indefinitely.
 * @param daysOld Number of days to keep (default: 7)
 */
export async function deleteOldNewsArticles(daysOld: number = 7): Promise<number> {
  const supabase = getSupabaseClient();
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const { data, error } = await supabase
    .from('news_articles')
    .delete()
    .lt('fetched_at', cutoffDate.toISOString())
    .select('id');

  if (error) {
    throw new Error(`Failed to delete old news articles: ${error.message}`);
  }

  return data?.length ?? 0;
}

/**
 * Map a database row to a NewsArticle object.
 */
function mapRowToNewsArticle(row: any): NewsArticle {
  return {
    id: row.id,
    title: row.title,
    link: row.link,
    sourceName: row.source_name,
    sourceIcon: row.source_icon,
    thumbnail: row.thumbnail,
    thumbnailSmall: row.thumbnail_small,
    publishedAt: row.published_at ? new Date(row.published_at) : null,
    fetchedAt: new Date(row.fetched_at),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}
