/**
 * SerpApi client for making API requests.
 */

export interface SerpApiResponse {
  sports_results?: {
    league?: {
      standings?: SerpApiStandingRow[];
    };
  };
  search_metadata?: {
    id?: string;
  };
  error?: string;
}

export interface SerpApiStandingRow {
  team: {
    name: string;
    thumbnail?: string;
  };
  w: string; // wins as string
  l: string; // losses as string
  pct?: string; // winning percentage as string (e.g., ".566")
  gb: string; // games back as string (e.g., "-" for leader, "3.5" for others)
  home?: string; // home record (e.g., "39-30")
  away?: string; // away record (e.g., "38-29")
  l10?: string; // last 10 games record (e.g., "6-4")
}

export class SerpApiClient {
  private apiKey: string;
  private baseUrl = 'https://serpapi.com/search.json';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('SerpApi API key is required');
    }
    this.apiKey = apiKey;
  }

  /**
   * Search SerpApi with a query string.
   * @param query The search query (e.g., "Yomiuri Giants standings 2026")
   * @returns The parsed JSON response
   */
  async search(query: string): Promise<SerpApiResponse> {
    const url = new URL(this.baseUrl);
    url.searchParams.set('engine', 'google');
    url.searchParams.set('q', query);
    url.searchParams.set('api_key', this.apiKey);

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(
        `SerpApi returned error status ${response.status}: ${response.statusText}`
      );
    }

    const json = (await response.json()) as SerpApiResponse;

    // Check for API errors
    if (json.error) {
      throw new Error(`SerpApi API error: ${json.error}`);
    }

    return json;
  }
}
