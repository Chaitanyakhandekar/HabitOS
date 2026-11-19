import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

const requiredEnvVars = ['MONGODB_URI', 'JWT_ACCESS_SECRET'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`CRITICAL: Missing required environment variable: ${envVar}`);
  }
}

export const env = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  EXPIRES_IN_ACCESS_TOKEN: process.env.EXPIRES_IN_ACCESS_TOKEN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  isProduction: process.env.NODE_ENV === 'production',
};
