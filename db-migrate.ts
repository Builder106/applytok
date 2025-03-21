#!/usr/bin/env tsx

/**
 * Database migration script
 * 
 * This script provides commands to manage database migrations:
 * - create: Create a new migration file
 * - migrate: Run all pending migrations
 * - init: Initialize the database schema
 * 
 * Usage:
 *   npm run db:migrate [command] [args]
 */

import { createMigration, createInitialMigration, runMigrations, migrationsExist } from './server/migration-manager';

async function main() {
  const command = process.argv[2];
  const args = process.argv.slice(3);

  switch (command) {
    case 'create':
      if (!args[0]) {
        console.error('Error: Migration name is required');
        console.error('Usage: npm run db:migrate create <migration-name>');
        process.exit(1);
      }
      await createMigration(args[0]);
      break;

    case 'migrate':
      await runMigrations();
      break;

    case 'init':
      const migrationsAlreadyExist = await migrationsExist();
      if (migrationsAlreadyExist) {
        console.log('Migrations already exist. To initialize, please remove the migrations directory first.');
        process.exit(1);
      }
      
      await createInitialMigration();
      console.log('Initial migration created. Run "npm run db:migrate migrate" to apply it.');
      break;

    default:
      console.error('Unknown command:', command);
      console.error('Available commands: create, migrate, init');
      process.exit(1);
  }
}

main().catch(error => {
  console.error('Error in migration script:', error);
  process.exit(1);
});