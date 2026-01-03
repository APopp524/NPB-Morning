import { describe, it, expect, beforeEach, vi } from 'vitest';
import Fastify from 'fastify';
import { NPBDataProvider } from '../backend/providers/types';
import { registerCronRoutes } from '../backend/routes/cron';
import { mockTeams, mockGames, mockStandings } from './fixtures';
import * as teamsDb from '../backend/db/teams';
import * as gamesDb from '../backend/db/games';
import * as standingsDb from '../backend/db/standings';

// Mock Supabase client
vi.mock('../backend/db/client', () => ({
  getSupabaseClient: vi.fn(() => ({
    from: vi.fn(() => ({
      upsert: vi.fn(() => ({
        onConflict: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: {
                id: 'test-id',
                name: 'Test Team',
                name_en: 'Test Team',
                league: 'central',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              error: null,
            })),
          })),
        })),
      })),
    })),
  })),
}));

// Mock database functions
vi.mock('../backend/db/teams');
vi.mock('../backend/db/games');
vi.mock('../backend/db/standings');

describe('Cron Route', () => {
  let fastify: ReturnType<typeof Fastify>;
  let mockProvider: NPBDataProvider;

  beforeEach(() => {
    fastify = Fastify({ logger: false });
    mockProvider = {
      fetchGames: vi.fn().mockResolvedValue(mockGames),
      fetchStandings: vi.fn().mockResolvedValue(mockStandings),
      fetchStandingsForBothLeagues: vi.fn().mockResolvedValue(mockStandings),
    };

    // Mock countTeams to return 12 (teams validation at startup)
    vi.mocked(teamsDb.countTeams).mockResolvedValue(12);

    vi.mocked(gamesDb.upsertGames).mockResolvedValue(
      mockGames.map((g, i) => ({
        id: `game-${i}`,
        ...g,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );

    vi.mocked(standingsDb.upsertStandings).mockResolvedValue(
      mockStandings.map((s, i) => ({
        id: `standing-${i}`,
        ...s,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );
  });

  it('should fetch and upsert data successfully', async () => {
    await registerCronRoutes(fastify, mockProvider);

    const response = await fastify.inject({
      method: 'GET',
      url: '/cron/daily',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.success).toBe(true);
    expect(body.counts.games).toBe(mockGames.length);
    expect(body.counts.standings).toBe(mockStandings.length);

    // Teams are NOT fetched by cron (they are seeded via migration)
    expect(mockProvider.fetchGames).toHaveBeenCalledOnce();
    // Cron route uses fetchStandingsForBothLeagues if available
    if ('fetchStandingsForBothLeagues' in mockProvider) {
      expect((mockProvider as any).fetchStandingsForBothLeagues).toHaveBeenCalledOnce();
    } else {
      expect(mockProvider.fetchStandings).toHaveBeenCalledTimes(2); // Once per league
    }
    
    // Teams validation happens at startup
    expect(teamsDb.countTeams).toHaveBeenCalled();
  });

  it('should use custom date from query', async () => {
    await registerCronRoutes(fastify, mockProvider);

    const customDate = '2024-06-15';
    const response = await fastify.inject({
      method: 'GET',
      url: `/cron/daily?date=${customDate}`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.date).toBe(customDate);

    // Verify the date was passed as ISO string
    expect(mockProvider.fetchGames).toHaveBeenCalledWith(customDate);
  });

  it('should use custom season from query', async () => {
    await registerCronRoutes(fastify, mockProvider);

    const customSeason = 2023;
    const response = await fastify.inject({
      method: 'GET',
      url: `/cron/daily?season=${customSeason}`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.season).toBe(customSeason);

    // Cron route uses fetchStandingsForBothLeagues if available
    if ('fetchStandingsForBothLeagues' in mockProvider) {
      expect((mockProvider as any).fetchStandingsForBothLeagues).toHaveBeenCalledWith(customSeason);
    } else {
      expect(mockProvider.fetchStandings).toHaveBeenCalledWith(customSeason, 'central');
      expect(mockProvider.fetchStandings).toHaveBeenCalledWith(customSeason, 'pacific');
    }
  });

  it('should fail at startup if teams are missing', async () => {
    // Mock countTeams to return less than 12 (should fail at startup)
    vi.mocked(teamsDb.countTeams).mockResolvedValue(0);

    await expect(registerCronRoutes(fastify, mockProvider)).rejects.toThrow(
      /Expected 12 teams/
    );
  });

  it('should handle provider errors gracefully', async () => {
    const errorProvider: NPBDataProvider = {
      fetchGames: vi.fn().mockRejectedValue(new Error('Provider error')),
      fetchStandings: vi.fn().mockResolvedValue([]),
    };

    await registerCronRoutes(fastify, errorProvider);

    const response = await fastify.inject({
      method: 'GET',
      url: '/cron/daily',
    });

    expect(response.statusCode).toBe(500);
    const body = JSON.parse(response.body);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Provider error');
  });
});

