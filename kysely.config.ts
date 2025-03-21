import { config } from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file if it exists
config();

export default {
  migrationsDir: path.join(process.cwd(), 'migrations'),
  dbUrl: process.env.DATABASE_URL,
};