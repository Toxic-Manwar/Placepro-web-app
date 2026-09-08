import { execSync } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const dbUrl = process.env.DATABASE_URL || '';
const isSqlite = dbUrl.startsWith('file:') || dbUrl.includes('.db');
const schemaFile = isSqlite ? 'prisma/schema.sqlite.prisma' : 'prisma/schema.prisma';

console.log(`[Database Deploy] Synchronizing schema using ${isSqlite ? 'SQLite' : 'PostgreSQL'} (${schemaFile})...`);

try {
  if (!isSqlite) {
    try {
      execSync(`npx prisma migrate deploy --schema=${schemaFile}`, {
        cwd: path.join(__dirname, '..'),
        env: process.env,
        stdio: 'inherit'
      });
      console.log('✅ PostgreSQL migrations applied successfully!');
    } catch (migErr) {
      console.warn('⚠️ Migration deploy encountered an issue, falling back to prisma db push...');
      execSync(`npx prisma db push --schema=${schemaFile} --skip-generate`, {
        cwd: path.join(__dirname, '..'),
        env: process.env,
        stdio: 'inherit'
      });
      console.log('✅ PostgreSQL schema synchronized with db push!');
    }
  } else {
    execSync(`npx prisma db push --schema=${schemaFile} --skip-generate`, {
      cwd: path.join(__dirname, '..'),
      env: process.env,
      stdio: 'inherit'
    });
    console.log('✅ SQLite schema synchronized!');
  }
} catch (error) {
  console.error('❌ Failed to synchronize database:', error);
  process.exit(1);
}
