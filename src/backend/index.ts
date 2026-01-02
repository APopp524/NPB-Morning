import Fastify from 'fastify';
import { SerpApiProvider } from './providers/serpapi';
import { registerCronRoutes } from './routes/cron';

const fastify = Fastify({
  logger: true,
});

async function start() {
  try {
    // Initialize provider
    const provider = new SerpApiProvider();

    // Register routes
    await registerCronRoutes(fastify, provider);

    // Health check
    fastify.get('/health', async () => {
      return { status: 'ok' };
    });

    const port = parseInt(process.env.PORT || '3000', 10);
    const host = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port, host });
    fastify.log.info(`Server listening on ${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();

