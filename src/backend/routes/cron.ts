import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { NPBDataProvider } from '../providers/types';
import { SerpApiProvider } from '../providers/serpapi';
import { countTeams } from '../db/teams';
import { upsertGames } from '../db/games';
import { upsertStandings } from '../db/standings';
import { GameInput } from '../models/game';
import { getTeams } from '../db/teams';
import { mapSerpApiTeamNameToDatabaseTeam } from '../providers/serpapi/team-map';

interface CronDailyQuery {
  date?: string;
  season?: number;
}

export async function registerCronRoutes(
  fastify: FastifyInstance,
  provider: NPBDataProvider,
  serpApiProvider: SerpApiProvider
) {
  // Guard: Validate teams exist before registering routes
  // Teams are static configuration data seeded via migration.
  // Cron assumes teams already exist and will fail loudly if they do not.
  try {
    const teamCount = await countTeams();
    if (teamCount !== 12) {
      const error = new Error(
        `FATAL: Expected 12 teams in database but found ${teamCount}. ` +
          `Teams must be seeded via migration (supabase/migrations/002_seed_teams.sql) before cron can run.`
      );
      fastify.log.error(error);
      throw error;
    }
    fastify.log.info('✓ Teams validation passed: 12 teams found in database');
  } catch (error) {
    // If validation fails, we want to fail hard at startup
    fastify.log.error('FATAL: Teams validation failed. Server will not start.');
    throw error;
  }

  fastify.get(
    '/cron/daily',
    async (
      request: FastifyRequest<{ Querystring: CronDailyQuery }>,
      reply: FastifyReply
    ) => {
      try {
        // Get date from query or use today (as ISO string YYYY-MM-DD)
        let dateStr: string;
        if (request.query.date) {
          dateStr = request.query.date;
        } else {
          // Format today as YYYY-MM-DD (local time, not UTC)
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const year = today.getFullYear();
          const month = String(today.getMonth() + 1).padStart(2, '0');
          const day = String(today.getDate()).padStart(2, '0');
          dateStr = `${year}-${month}-${day}`;
        }

        // Get season from query or use current year
        const season =
          request.query.season !== undefined
            ? Number(request.query.season)
            : new Date().getFullYear();

        // Fetch data from provider
        // NOTE: Teams are NOT fetched here. Teams are static configuration data
        // seeded via migration. Cron assumes teams already exist.
        const [gamesResult, standings] = await Promise.all([
          serpApiProvider.fetchGamesReadOnly(),
          // Use fetchStandingsForBothLeagues if available, otherwise fetch both leagues separately
          'fetchStandingsForBothLeagues' in provider
            ? (provider as any).fetchStandingsForBothLeagues(season)
            : Promise.all([
                provider.fetchStandings(season, 'central'),
                provider.fetchStandings(season, 'pacific'),
              ]).then(results => results.flat()),
        ]);

        // Convert games from ParsedGame format to GameInput format
        const teams = await getTeams();
        const gameInputs: GameInput[] = [];
        
        if (gamesResult.status !== 'NO_GAMES' && gamesResult.games.length > 0) {
          // Determine status based on fetch result
          const gameStatus: GameInput['status'] = 
            gamesResult.status === 'LIVE' ? 'in_progress' : 'scheduled';

          for (const parsedGame of gamesResult.games) {
            // Map team names to team IDs
            const homeTeamId = mapSerpApiTeamNameToDatabaseTeam(parsedGame.home_team_name, teams);
            const awayTeamId = mapSerpApiTeamNameToDatabaseTeam(parsedGame.away_team_name, teams);

            // Skip if team mapping fails
            if (!homeTeamId || !awayTeamId) {
              fastify.log.warn(
                `Skipping game: could not map teams "${parsedGame.home_team_name}" or "${parsedGame.away_team_name}"`
              );
              continue;
            }

            // Parse date - use game_date if available, otherwise use dateStr (today)
            // When SerpApi returns dates without year (e.g., "Mar 27"), assume current year
            let gameDate = dateStr;
            if (parsedGame.game_date) {
              try {
                // Get current year for date parsing
                const currentYear = new Date().getFullYear();
                
                // Check if date string includes a year (4 digits)
                const hasYear = /\d{4}/.test(parsedGame.game_date);
                
                let parsedDate: Date;
                if (hasYear) {
                  // Date includes year, parse as-is
                  parsedDate = new Date(parsedGame.game_date);
                } else {
                  // Date doesn't include year, append current year
                  // Format: "Mar 27" -> "Mar 27, 2026"
                  parsedDate = new Date(`${parsedGame.game_date}, ${currentYear}`);
                }
                
                if (!isNaN(parsedDate.getTime())) {
                  const year = parsedDate.getFullYear();
                  const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
                  const day = String(parsedDate.getDate()).padStart(2, '0');
                  gameDate = `${year}-${month}-${day}`;
                } else {
                  // If parsing fails, use dateStr (today)
                  gameDate = dateStr;
                }
              } catch {
                // If parsing fails, use dateStr (today)
                gameDate = dateStr;
              }
            }

            gameInputs.push({
              date: gameDate,
              homeTeamId,
              awayTeamId,
              homeScore: null, // Scores not available from SerpApi games endpoint yet
              awayScore: null,
              status: gameStatus,
            });
          }
        }

        // Upsert games and standings
        const [upsertedGames, upsertedStandings] = await Promise.all([
          upsertGames(gameInputs),
          upsertStandings(standings),
        ]);

        return {
          success: true,
          date: dateStr, // Already in ISO format (YYYY-MM-DD)
          season,
          gamesStatus: gamesResult.status,
          counts: {
            games: upsertedGames.length,
            standings: upsertedStandings.length,
          },
        };
      } catch (error) {
        fastify.log.error(error);
        reply.code(500);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  );
}

