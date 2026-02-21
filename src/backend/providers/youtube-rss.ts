/**
 * YouTube RSS feed parser.
 * Fetches the most recent uploads from a YouTube channel using the
 * free public Atom feed at youtube.com/feeds/videos.xml?channel_id=...
 *
 * Returns up to 15 entries (YouTube's RSS limit) sorted newest-first.
 * No API key required.
 */

import { XMLParser } from 'fast-xml-parser';

export interface YouTubeVideoResult {
  videoId: string;
  title: string;
  thumbnail: string | null;
  publishedAt: string | null;
  channelName: string | null;
  link: string;
}

interface AtomEntry {
  'yt:videoId': string;
  title: string;
  published: string;
  updated: string;
  author?: { name?: string };
  'media:group'?: {
    'media:thumbnail'?: { '@_url'?: string } | { '@_url'?: string }[];
  };
}

interface AtomFeed {
  feed?: {
    title?: string;
    entry?: AtomEntry | AtomEntry[];
  };
}

const RSS_BASE = 'https://www.youtube.com/feeds/videos.xml';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
});

/**
 * Fetch recent videos from a YouTube channel's RSS feed.
 *
 * @param channelId  YouTube channel ID (e.g. "UCXxg0igSYUp0tqdd6luPEnQ")
 * @param limit      Max results to return (capped at 15 by YouTube)
 */
export async function fetchChannelVideosRSS(
  channelId: string,
  limit: number = 6
): Promise<YouTubeVideoResult[]> {
  const url = `${RSS_BASE}?channel_id=${encodeURIComponent(channelId)}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `YouTube RSS feed returned ${response.status}: ${response.statusText} for channel ${channelId}`
    );
  }

  const xml = await response.text();
  const parsed = parser.parse(xml) as AtomFeed;

  const feed = parsed.feed;
  if (!feed?.entry) {
    return [];
  }

  const entries = Array.isArray(feed.entry) ? feed.entry : [feed.entry];
  const channelName = feed.title ?? null;

  const videos: YouTubeVideoResult[] = [];

  for (const entry of entries) {
    if (videos.length >= limit) break;

    const videoId = entry['yt:videoId'];
    if (!videoId) continue;

    let thumbnail: string | null = null;
    const mediaGroup = entry['media:group'];
    if (mediaGroup?.['media:thumbnail']) {
      const thumb = mediaGroup['media:thumbnail'];
      if (Array.isArray(thumb)) {
        thumbnail = thumb[0]?.['@_url'] ?? null;
      } else {
        thumbnail = thumb['@_url'] ?? null;
      }
    }
    if (!thumbnail) {
      thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    }

    videos.push({
      videoId,
      title: typeof entry.title === 'string' ? entry.title : String(entry.title),
      thumbnail,
      publishedAt: entry.published ?? null,
      channelName: entry.author?.name ?? channelName,
      link: `https://www.youtube.com/watch?v=${videoId}`,
    });
  }

  return videos;
}
