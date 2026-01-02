import {
  NPBDataProvider,
  SerpApiGameResponse,
  SerpApiStandingResponse,
  SerpApiTeamResponse,
} from './types';
import { GameInput, ISODateString, StandingInput, TeamInput } from '../models';
import {
  generateTeamId,
  normalizeTeamNameToCanonical,
} from '../utils/team-id';

type ProviderMode = 'mock' | 'live';

export class SerpApiProvider implements NPBDataProvider {
  private apiKey: string;
  private baseUrl: string = 'https://serpapi.com/search.json';
  private mode: ProviderMode;

  constructor(apiKey?: string, mode: ProviderMode = 'mock') {
    this.apiKey = apiKey || process.env.SERPAPI_KEY || '';
    this.mode = mode;
  }

  async fetchGames(date: ISODateString): Promise<GameInput[]> {
    if (this.mode === 'mock') {
      return this.mockFetchGames(date);
    }
    return this.liveFetchGames(date);
  }

  async fetchStandings(season: number): Promise<StandingInput[]> {
    if (this.mode === 'mock') {
      return this.mockFetchStandings(season);
    }
    return this.liveFetchStandings(season);
  }

  async fetchTeams(): Promise<TeamInput[]> {
    if (this.mode === 'mock') {
      return this.mockFetchTeams();
    }
    return this.liveFetchTeams();
  }

  // ============================================================================
  // Live API Methods (Placeholder for future implementation)
  // ============================================================================

  private async liveFetchGames(date: ISODateString): Promise<GameInput[]> {
    // TODO: Implement real SerpApi HTTP call
    // This will fetch from SerpApi and normalize the response
    throw new Error('Live API mode not yet implemented');
  }

  private async liveFetchStandings(season: number): Promise<StandingInput[]> {
    // TODO: Implement real SerpApi HTTP call
    throw new Error('Live API mode not yet implemented');
  }

  private async liveFetchTeams(): Promise<TeamInput[]> {
    // TODO: Implement real SerpApi HTTP call
    throw new Error('Live API mode not yet implemented');
  }

  // ============================================================================
  // Mock Methods (Current Implementation)
  // ============================================================================

  private mockFetchGames(date: ISODateString): GameInput[] {
    const mockResponse: SerpApiGameResponse[] = [
      {
        homeTeam: 'Yomiuri Giants',
        awayTeam: 'Hanshin Tigers',
        homeScore: 5,
        awayScore: 3,
        status: 'completed',
      },
      {
        homeTeam: 'Yomiuri Giants',
        awayTeam: 'Chunichi Dragons',
        homeScore: null,
        awayScore: null,
        status: 'scheduled',
      },
    ];

    return this.normalizeGames(mockResponse, date);
  }

  private mockFetchStandings(season: number): StandingInput[] {
    const mockResponse: SerpApiStandingResponse[] = [
      {
        team: 'Yomiuri Giants',
        wins: 85,
        losses: 55,
        ties: 4,
        gamesBack: 0,
      },
      {
        team: 'Hanshin Tigers',
        wins: 82,
        losses: 58,
        ties: 4,
        gamesBack: 3,
      },
    ];

    return this.normalizeStandings(mockResponse, season);
  }

  private mockFetchTeams(): TeamInput[] {
    const mockResponse: SerpApiTeamResponse[] = [
      {
        name: '読売ジャイアンツ',
        nameEn: 'Yomiuri Giants',
        league: 'central',
      },
      {
        name: '阪神タイガース',
        nameEn: 'Hanshin Tigers',
        league: 'central',
      },
      {
        name: '中日ドラゴンズ',
        nameEn: 'Chunichi Dragons',
        league: 'central',
      },
      {
        name: '東京ヤクルトスワローズ',
        nameEn: 'Tokyo Yakult Swallows',
        league: 'central',
      },
      {
        name: '広島東洋カープ',
        nameEn: 'Hiroshima Toyo Carp',
        league: 'central',
      },
      {
        name: '横浜DeNAベイスターズ',
        nameEn: 'Yokohama DeNA BayStars',
        league: 'central',
      },
      {
        name: '福岡ソフトバンクホークス',
        nameEn: 'Fukuoka SoftBank Hawks',
        league: 'pacific',
      },
      {
        name: '千葉ロッテマリーンズ',
        nameEn: 'Chiba Lotte Marines',
        league: 'pacific',
      },
      {
        name: '東北楽天ゴールデンイーグルス',
        nameEn: 'Tohoku Rakuten Golden Eagles',
        league: 'pacific',
      },
      {
        name: '埼玉西武ライオンズ',
        nameEn: 'Saitama Seibu Lions',
        league: 'pacific',
      },
      {
        name: '北海道日本ハムファイターズ',
        nameEn: 'Hokkaido Nippon-Ham Fighters',
        league: 'pacific',
      },
      {
        name: 'オリックス・バファローズ',
        nameEn: 'Orix Buffaloes',
        league: 'pacific',
      },
    ];

    return this.normalizeTeams(mockResponse);
  }

  // ============================================================================
  // Normalization Methods
  // ============================================================================

  /**
   * Normalize raw SerpApi team responses to TeamInput.
   * This explicit normalization step future-proofs the provider boundary.
   */
  private normalizeTeams(teams: SerpApiTeamResponse[]): TeamInput[] {
    this.validateTeams(teams);

    return teams.map((team) => {
      // Generate team ID using canonical name and ID generation logic
      const canonicalName = normalizeTeamNameToCanonical(team.nameEn);
      const teamId = generateTeamId(canonicalName);

      return {
        name: team.name,
        nameEn: team.nameEn,
        league: team.league,
      };
    });
  }

  private normalizeGames(
    games: SerpApiGameResponse[],
    date: ISODateString
  ): GameInput[] {
    this.validateGames(games);

    return games.map((game) => ({
      date, // Already in ISO format (YYYY-MM-DD)
      homeTeamId: this.normalizeTeamName(game.homeTeam),
      awayTeamId: this.normalizeTeamName(game.awayTeam),
      homeScore: game.homeScore ?? null,
      awayScore: game.awayScore ?? null,
      status: this.normalizeStatus(game.status),
    }));
  }

  private normalizeStandings(
    standings: SerpApiStandingResponse[],
    season: number
  ): StandingInput[] {
    this.validateStandings(standings);

    return standings.map((standing) => ({
      teamId: this.normalizeTeamName(standing.team),
      season,
      wins: standing.wins,
      losses: standing.losses,
      ties: standing.ties,
      gamesBack: standing.gamesBack,
    }));
  }

  private normalizeTeamName(teamName: string): string {
    // First normalize to canonical name (handles aliases)
    const canonicalName = normalizeTeamNameToCanonical(teamName);
    // Then generate ID using the same logic as the database
    return generateTeamId(canonicalName);
  }

  /**
   * Normalize game status from provider response.
   * Returns 'unknown' for unrecognized statuses to fail loudly.
   */
  private normalizeStatus(status?: string): GameInput['status'] {
    if (!status) return 'scheduled';

    const normalized = status.toLowerCase().trim();

    // Completed states
    if (
      normalized.includes('completed') ||
      normalized.includes('final') ||
      normalized === 'final'
    ) {
      return 'completed';
    }

    // In progress states
    if (
      normalized.includes('in progress') ||
      normalized.includes('live') ||
      normalized.includes('playing') ||
      normalized === 'live'
    ) {
      return 'in_progress';
    }

    // Postponed states
    if (
      normalized.includes('postponed') ||
      normalized.includes('delayed') ||
      normalized.includes('rain delay') ||
      normalized === 'postponed'
    ) {
      return 'postponed';
    }

    // Scheduled states
    if (
      normalized.includes('scheduled') ||
      normalized.includes('upcoming') ||
      normalized === 'scheduled' ||
      normalized === 'upcoming'
    ) {
      return 'scheduled';
    }

    // Suspended or cancelled states
    if (
      normalized.includes('suspended') ||
      normalized.includes('cancelled') ||
      normalized.includes('canceled')
    ) {
      return 'postponed'; // Map suspended/cancelled to postponed for now
    }

    // Unknown - fail loudly instead of silently misclassifying
    return 'unknown';
  }

  // ============================================================================
  // Validation Methods
  // ============================================================================

  /**
   * Validate team responses before normalization.
   * Throws explicit errors for malformed data.
   */
  private validateTeams(teams: SerpApiTeamResponse[]): void {
    if (!Array.isArray(teams)) {
      throw new Error('Teams response must be an array');
    }

    teams.forEach((team, index) => {
      if (!team.name || typeof team.name !== 'string') {
        throw new Error(
          `Team at index ${index} missing or invalid 'name' field`
        );
      }
      if (!team.nameEn || typeof team.nameEn !== 'string') {
        throw new Error(
          `Team at index ${index} missing or invalid 'nameEn' field`
        );
      }
      if (!team.league || !['central', 'pacific'].includes(team.league)) {
        throw new Error(
          `Team at index ${index} missing or invalid 'league' field (must be 'central' or 'pacific')`
        );
      }
    });
  }

  /**
   * Validate game responses before normalization.
   * Throws explicit errors for malformed data.
   */
  private validateGames(games: SerpApiGameResponse[]): void {
    if (!Array.isArray(games)) {
      throw new Error('Games response must be an array');
    }

    games.forEach((game, index) => {
      if (!game.homeTeam || typeof game.homeTeam !== 'string') {
        throw new Error(
          `Game at index ${index} missing or invalid 'homeTeam' field`
        );
      }
      if (!game.awayTeam || typeof game.awayTeam !== 'string') {
        throw new Error(
          `Game at index ${index} missing or invalid 'awayTeam' field`
        );
      }
      // Scores can be null/undefined, but if present must be numbers
      if (
        game.homeScore !== null &&
        game.homeScore !== undefined &&
        typeof game.homeScore !== 'number'
      ) {
        throw new Error(
          `Game at index ${index} has invalid 'homeScore' (must be number or null)`
        );
      }
      if (
        game.awayScore !== null &&
        game.awayScore !== undefined &&
        typeof game.awayScore !== 'number'
      ) {
        throw new Error(
          `Game at index ${index} has invalid 'awayScore' (must be number or null)`
        );
      }
    });
  }

  /**
   * Validate standings responses before normalization.
   * Throws explicit errors for malformed data.
   */
  private validateStandings(standings: SerpApiStandingResponse[]): void {
    if (!Array.isArray(standings)) {
      throw new Error('Standings response must be an array');
    }

    standings.forEach((standing, index) => {
      if (!standing.team || typeof standing.team !== 'string') {
        throw new Error(
          `Standing at index ${index} missing or invalid 'team' field`
        );
      }
      if (typeof standing.wins !== 'number' || standing.wins < 0) {
        throw new Error(
          `Standing at index ${index} missing or invalid 'wins' field`
        );
      }
      if (typeof standing.losses !== 'number' || standing.losses < 0) {
        throw new Error(
          `Standing at index ${index} missing or invalid 'losses' field`
        );
      }
      if (typeof standing.ties !== 'number' || standing.ties < 0) {
        throw new Error(
          `Standing at index ${index} missing or invalid 'ties' field`
        );
      }
      if (typeof standing.gamesBack !== 'number' || standing.gamesBack < 0) {
        throw new Error(
          `Standing at index ${index} missing or invalid 'gamesBack' field`
        );
      }
    });
  }
}
