import { execSync } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const dbUrl = process.env.DATABASE_URL || '';
const isSqlite = dbUrl.startsWith('file:') || dbUrl.includes('.db');

const schemaFile = isSqlite ? 'prisma/schema.sqlite.prisma' : 'prisma/schema.prisma';
const fallbackUrl = isSqlite ? 'file:./dev.db' : 'postgresql://postgres:postgres@localhost:5432/placepro';

console.log(`[Prisma Generate] Using ${isSqlite ? 'SQLite' : 'PostgreSQL'} schema (${schemaFile})...`);

try {
  execSync(`npx prisma generate --schema=${schemaFile}`, {
    cwd: path.join(__dirname, '..'),
    env: {
      ...process.env,
      DATABASE_URL: dbUrl || fallbackUrl
    },
    stdio: 'inherit'
  });
  console.log('✅ Prisma Client generated successfully!');
} catch (error) {
  const clientPath = path.join(__dirname, '../node_modules/@prisma/client');
  if (fs.existsSync(clientPath) && process.platform === 'win32') {
    console.warn('⚠️ Prisma Client binary is currently locked by a running local Node process, but client is already present. Proceeding with build...');
  } else {
    console.error('❌ Failed to generate Prisma Client:', error.message);
    process.exit(1);
  }
}
