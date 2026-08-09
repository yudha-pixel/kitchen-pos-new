import { app } from './app';
import { prisma } from './lib/prisma';

const PORT = Number(process.env.PORT || 3000);
const API_HOST = process.env.API_HOST || '0.0.0.0';

const server = app.listen(PORT, API_HOST, () => {
  console.log(`🚀 Kitchen POS API running at http://${API_HOST}:${PORT}`);
});

const gracefulShutdown = async () => {
  console.log('Shutting down API...');
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
