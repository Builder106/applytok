import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
import { parse } from 'pg-connection-string';

// Define your database interface here
export interface Database {
  users: {
    id: number;
    username: string;
    password: string;
    email: string;
    full_name: string;
    headline: string | null;
    bio: string | null;
    location: string | null;
    profile_image: string | null;
    user_type: string;
    company_name: string | null;
    company_logo: string | null;
    skills: string[] | null;
    created_at: Date;
  };
  videos: {
    id: number;
    user_id: number;
    title: string;
    description: string | null;
    video_url: string;
    thumbnail_url: string | null;
    video_type: string;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    skills: string[] | null;
    salary: string | null;
    location: string | null;
    job_type: string | null;
    duration: number | null;
    created_at: Date;
  };
  applications: {
    id: number;
    job_video_id: number;
    user_video_id: number;
    user_id: number;
    employer_id: number;
    status: string;
    note: string | null;
    resume_url: string | null;
    created_at: Date;
  };
  comments: {
    id: number;
    video_id: number;
    user_id: number;
    content: string;
    created_at: Date;
  };
  messages: {
    id: number;
    sender_id: number;
    receiver_id: number;
    content: string;
    read: boolean;
    created_at: Date;
  };
  bookmarks: {
    id: number;
    user_id: number;
    video_id: number;
    created_at: Date;
  };
  migrations: {
    id: number;
    name: string;
    timestamp: Date;
  };
}

// Create a Kysely instance for your database
export function createDb(): Kysely<Database> {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const connectionConfig = parse(connectionString);
  
  // Create a PostgreSQL dialect instance with the connection pool
  const dialect = new PostgresDialect({
    pool: new pg.Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
      max: 10, // Maximum number of connections in the pool
    }),
  });

  // Create and return a Kysely instance
  return new Kysely<Database>({
    dialect,
  });
}

// Export a singleton db instance
export const db = createDb();