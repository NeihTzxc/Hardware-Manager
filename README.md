# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

# How to seed the database
npx tsx prisma/seed.ts

## Database Backup & Restore

The application provides automated shell scripts to backup and restore the PostgreSQL database. 
**Note:** `pg_dump` and `psql` must be installed on your system (e.g., `brew install postgresql` on macOS). The scripts will automatically load the `DATABASE_URL` from your `.env` file.

### Backup

Run the backup script to export your database to a compressed `.sql.gz` file located in the `backups/` directory.

```bash
./scripts/backup.sh
```

### Restore

Run the restore script to replace the current database with a backup file. 

```bash
# If you have only 1 backup file in the 'backups/' folder, it will be automatically selected:
./scripts/restore.sh

# If there are multiple backups, specify the exact file you want to restore:
./scripts/restore.sh backups/db_backup_YYYYMMDD_HHMMSS.sql.gz
```
> **Warning:** Restoring a database will cleanly overwrite your current dataset. Use with caution!