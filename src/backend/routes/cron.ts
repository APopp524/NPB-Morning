import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { NPBDataProvider } from '../providers/types';
import { countTeams } from '../db/teams';
import { upsertGames } from '../db/games';
import { upsertStandings } from '../db/standings';

interface CronDailyQuery {
  date?: string;
  season?: number;
}

export async function registerCronRoutes(
  fastify: FastifyInstance,
  provider: NPBDataProvider
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
        const [games, standings] = await Promise.all([
          provider.fetchGames(dateStr),
          // Use fetchStandingsForBothLeagues if available, otherwise fetch both leagues separately
          'fetchStandingsForBothLeagues' in provider
            ? (provider as any).fetchStandingsForBothLeagues(season)
            : Promise.all([
                provider.fetchStandings(season, 'central'),
                provider.fetchStandings(season, 'pacific'),
              ]).then(results => results.flat()),
        ]);

        // Upsert games and standings
        const [upsertedGames, upsertedStandings] = await Promise.all([
          upsertGames(games),
          upsertStandings(standings),
        ]);

        return {
          success: true,
          date: dateStr, // Already in ISO format (YYYY-MM-DD)
          season,
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

