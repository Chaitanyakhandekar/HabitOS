import { connectDB } from './config/database.js';
import { httpServer } from './server.js';
import { env } from './config/env.js';

const startServer = async () => {
  try {
    await connectDB();
    httpServer.listen(env.PORT, () => {
      console.log(`HabitOS API Server running on port ${env.PORT} [${env.NODE_ENV}]`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
