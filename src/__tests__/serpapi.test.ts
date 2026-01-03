import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SerpApiProvider } from '../backend/providers/serpapi';
import * as teamsDb from '../backend/db/teams';
import { Team } from '../backend/models/team';

// Mock global fetch
global.fetch = vi.fn();

// Mock database functions
vi.mock('../backend/db/teams', () => ({
  getFirstTeam: vi.fn(),
  getTeams: vi.fn(),
}));

// Mock Supabase client to avoid requiring env vars
vi.mock('../backend/db/client', () => ({
  getSupabaseClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
      })),
    })),
  })),
}));

describe('SerpApiProvider - Live Mode Standings', () => {
  const mockTeam: Team = {
    id: 'yomiuri-giants',
    name: '読売ジャイアンツ',
    nameEn: 'Yomiuri Giants',
    league: 'central',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTeams: Team[] = [
    mockTeam,
    {
      id: 'hanshin-tigers',
      name: '阪神タイガース',
      nameEn: 'Hanshin Tigers',
      league: 'central',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(teamsDb.getFirstTeam).mockResolvedValue(mockTeam);
    vi.mocked(teamsDb.getTeams).mockResolvedValue(mockTeams);
  });

  it('should throw error when standings are missing from SerpApi response', async () => {
    const provider = new SerpApiProvider('test-api-key', 'live');

    // Mock fetch to return a response without standings data
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        // Response without any standings data
        organic_results: [],
        knowledge_graph: {},
        search_metadata: {
          id: 'test-search-id',
        },
      }),
    } as Response);

    await expect(provider.fetchStandings(2024, 'central')).rejects.toThrow(
      /No sports_results found in SerpApi response/
    );
  });

  it('should throw error when required fields are missing in standings row', async () => {
    const provider = new SerpApiProvider('test-api-key', 'live');

    // Mock fetch to return a response with invalid standings data
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        sports_results: {
          league: {
            standings: [
              {
                // Missing required fields
                team: null,
                w: null,
                l: null,
                gb: null,
              },
            ],
          },
        },
        search_metadata: {
          id: 'test-search-id',
        },
      }),
    } as Response);

    await expect(provider.fetchStandings(2024, 'central')).rejects.toThrow(
      /Invalid standings row: missing team name/
    );
  });

  it('should throw error when API key is missing in live mode', () => {
    expect(() => {
      new SerpApiProvider(undefined, 'live');
    }).toThrow(/SerpApi API key is required for live mode/);
  });
});

