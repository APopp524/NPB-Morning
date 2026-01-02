import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { NPBDataProvider } from '../providers/types';
import { upsertTeams } from '../db/teams';
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

        // Fetch data from provider (date is now ISO string)
        const [teams, games, standings] = await Promise.all([
          provider.fetchTeams(),
          provider.fetchGames(dateStr),
          provider.fetchStandings(season),
        ]);

        // Upsert teams first (games and standings depend on teams)
        const upsertedTeams = await upsertTeams(teams);

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
            teams: upsertedTeams.length,
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

