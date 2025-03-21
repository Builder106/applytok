import { Kysely, Migrator, FileMigrationProvider, Migration, sql } from 'kysely';
import * as path from 'path';
import * as fs from 'fs';
import * as fsExtra from 'fs-extra';
import { promises as fsPromises } from 'fs';
import { Database, db } from './database';

// Define the migrations table structure
interface MigrationRow {
  name: string;
  timestamp: Date;
}

// Create the migrations directory if it doesn't exist
const migrationsDir = path.join(process.cwd(), 'migrations');
if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
}

// Function to create a new migration file
export async function createMigration(name: string): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '').split('.')[0];
  const fileName = `${timestamp}_${name}.ts`;
  const filePath = path.join(migrationsDir, fileName);
  
  const template = `import { Kysely, Migration } from 'kysely';

export const up = async (db: Kysely<any>) => {
  // Write your migration code here
  // For example:
  // await db.schema
  //   .createTable('your_table')
  //   .addColumn('id', 'serial', (col) => col.primaryKey())
  //   .addColumn('name', 'text', (col) => col.notNull())
  //   .execute();
};

export const down = async (db: Kysely<any>) => {
  // Write your rollback code here
  // For example:
  // await db.schema.dropTable('your_table').execute();
};
`;
  
  await fsPromises.writeFile(filePath, template, 'utf8');
  console.log(`Created migration: ${filePath}`);
  
  return filePath;
}

// Function to create initial migration from schema
export async function createInitialMigration(): Promise<string> {
  const initialMigrationPath = await createMigration('initial_schema');
  
  const initialMigration = `import { Kysely, Migration, sql } from 'kysely';

export const up = async (db: Kysely<any>) => {
  // Create migrations table
  await db.schema
    .createTable('migrations')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addColumn('timestamp', 'timestamp', (col) => col.notNull().defaultTo(sql\`now()\`))
    .execute();

  // Create users table
  await db.schema
    .createTable('users')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('username', 'varchar', (col) => col.notNull().unique())
    .addColumn('password', 'varchar', (col) => col.notNull())
    .addColumn('email', 'varchar', (col) => col.notNull().unique())
    .addColumn('full_name', 'varchar', (col) => col.notNull())
    .addColumn('headline', 'varchar')
    .addColumn('bio', 'text')
    .addColumn('location', 'varchar')
    .addColumn('profile_image', 'varchar')
    .addColumn('user_type', 'varchar', (col) => col.notNull())
    .addColumn('company_name', 'varchar')
    .addColumn('company_logo', 'varchar')
    .addColumn('skills', 'varchar[]')
    .addColumn('created_at', 'timestamp', (col) => col.notNull().defaultTo(sql\`now()\`))
    .execute();

  // Create videos table
  await db.schema
    .createTable('videos')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('user_id', 'integer', (col) => col.notNull())
    .addColumn('title', 'varchar', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('video_url', 'varchar', (col) => col.notNull())
    .addColumn('thumbnail_url', 'varchar')
    .addColumn('video_type', 'varchar', (col) => col.notNull())
    .addColumn('views', 'integer', (col) => col.defaultTo(0))
    .addColumn('likes', 'integer', (col) => col.defaultTo(0))
    .addColumn('comments', 'integer', (col) => col.defaultTo(0))
    .addColumn('shares', 'integer', (col) => col.defaultTo(0))
    .addColumn('skills', 'varchar[]')
    .addColumn('salary', 'varchar')
    .addColumn('location', 'varchar')
    .addColumn('job_type', 'varchar')
    .addColumn('duration', 'integer')
    .addColumn('created_at', 'timestamp', (col) => col.notNull().defaultTo(sql\`now()\`))
    .execute();

  // Create applications table
  await db.schema
    .createTable('applications')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('job_video_id', 'integer', (col) => col.notNull())
    .addColumn('user_video_id', 'integer', (col) => col.notNull())
    .addColumn('user_id', 'integer', (col) => col.notNull())
    .addColumn('employer_id', 'integer', (col) => col.notNull())
    .addColumn('status', 'varchar', (col) => col.notNull().defaultTo('pending'))
    .addColumn('note', 'text')
    .addColumn('resume_url', 'varchar')
    .addColumn('created_at', 'timestamp', (col) => col.notNull().defaultTo(sql\`now()\`))
    .execute();

  // Create comments table
  await db.schema
    .createTable('comments')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('video_id', 'integer', (col) => col.notNull())
    .addColumn('user_id', 'integer', (col) => col.notNull())
    .addColumn('content', 'text', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) => col.notNull().defaultTo(sql\`now()\`))
    .execute();

  // Create messages table
  await db.schema
    .createTable('messages')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('sender_id', 'integer', (col) => col.notNull())
    .addColumn('receiver_id', 'integer', (col) => col.notNull())
    .addColumn('content', 'text', (col) => col.notNull())
    .addColumn('read', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('created_at', 'timestamp', (col) => col.notNull().defaultTo(sql\`now()\`))
    .execute();

  // Create bookmarks table
  await db.schema
    .createTable('bookmarks')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('user_id', 'integer', (col) => col.notNull())
    .addColumn('video_id', 'integer', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) => col.notNull().defaultTo(sql\`now()\`))
    .execute();
};

export const down = async (db: Kysely<any>) => {
  // Drop all tables in reverse order
  await db.schema.dropTable('bookmarks').execute();
  await db.schema.dropTable('messages').execute();
  await db.schema.dropTable('comments').execute();
  await db.schema.dropTable('applications').execute();
  await db.schema.dropTable('videos').execute();
  await db.schema.dropTable('users').execute();
  await db.schema.dropTable('migrations').execute();
};`;

  await fsPromises.writeFile(initialMigrationPath, initialMigration, 'utf8');
  console.log(`Created initial migration: ${initialMigrationPath}`);
  
  return initialMigrationPath;
}

// Function to run migrations
export async function runMigrations() {
  // Check if migrations table exists by querying the database
  try {
    // Try to check if the migrations table exists by performing a simple query
    await db.selectFrom('migrations').select('id').limit(1).execute();
    console.log('Migrations table already exists');
  } catch (error) {
    // If the query fails, the table likely doesn't exist, so create it
    console.log('Creating migrations table...');
    await db.schema
      .createTable('migrations')
      .addColumn('id', 'serial', (col) => col.primaryKey())
      .addColumn('name', 'varchar', (col) => col.notNull())
      .addColumn('timestamp', 'timestamp', (col) => col.notNull().defaultTo(sql`now()`))
      .execute();
    console.log('Created migrations table');
  }
  
  // Custom FS adapter for the Kysely FileMigrationProvider
  const fsAdapter = {
    readdir: async (path: string): Promise<string[]> => {
      return fsPromises.readdir(path);
    },
    readFile: async (path: string): Promise<string> => {
      return fsPromises.readFile(path, 'utf8');
    }
  };
  
  // Initialize the migrator
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs: fsAdapter,
      path,
      migrationFolder: migrationsDir,
    }),
    migrationTableName: 'migrations',
  });
  
  // Run the migrations
  const { error, results } = await migrator.migrateToLatest();
  
  if (error) {
    console.error('Failed to migrate:');
    console.error(error);
    process.exit(1);
  }
  
  if (results && results.length > 0) {
    for (const migration of results) {
      console.log(`Migration "${migration.migrationName}" completed`);
    }
    
    console.log('All migrations have been executed successfully');
  } else {
    console.log('No migrations to run - database is already up to date');
  }
  
  await db.destroy();
}

// Function to check if migrations exist
export async function migrationsExist(): Promise<boolean> {
  try {
    const files = await fsPromises.readdir(migrationsDir);
    return files.some((file: string) => file.endsWith('.ts') || file.endsWith('.js'));
  } catch (error) {
    return false;
  }
}