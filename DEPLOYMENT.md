# Local Deployment Guide - Kitchen POS

This guide covers running Kitchen POS locally on a single machine or a small LAN, using your own PostgreSQL instance.

## Prerequisites

- Windows / macOS / Linux machine with Node.js 18+
- PostgreSQL 14+ installed and running locally
- npm or yarn

## Step 1: Install dependencies

```bash
npm install
```

## Step 2: Configure environment variables

Create a `.env` file in the project root for the API and Prisma:

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/kitchen_pos?schema=public"
JWT_SECRET="change-this-to-a-long-random-string"
PORT=3001
API_HOST=0.0.0.0
```

Create a `.env.local` file in the project root for the Next.js frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**For LAN access**, replace `localhost` with the IP address of the machine running the API, e.g.:

```env
NEXT_PUBLIC_API_URL=http://192.168.1.10:3001
```

The API must also bind to `0.0.0.0` (already the default via `API_HOST`) so other devices can reach it.

## Step 3: Create the PostgreSQL database

Connect to your local PostgreSQL server as a superuser and create the database:

```sql
CREATE DATABASE kitchen_pos;
CREATE USER kitchen_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE kitchen_pos TO kitchen_user;
```

## Step 4: Apply the schema and seed data

```bash
npm run db:migrate
npm run db:seed
```

`db:seed` creates a default admin user:

- **Username:** `admin`
- **Password:** `admin`

Change this password after the first login by registering a new admin user or updating the database directly.

## Step 5: Start the application

```bash
npm run dev
```

This starts:

- Express API on `http://0.0.0.0:3001`
- Next.js frontend on `http://localhost:3000`

Open `http://localhost:3000` and log in with the default admin account.

## Step 6: Access from other devices (optional)

1. Make sure both devices are on the same network.
2. Find the API host's LAN IP (e.g. `192.168.1.10`).
3. Set `NEXT_PUBLIC_API_URL=http://192.168.1.10:3001` in `.env.local`.
4. Start the Next.js frontend bound to the LAN IP:

```bash
npx next dev --hostname 192.168.1.10
```

5. On the client device, open `http://192.168.1.10:3000`.

## Production Deployment Notes

Kitchen POS is designed to run on a local network. If you need to expose it over the internet, place the API and frontend behind a reverse proxy (e.g. Nginx or Caddy) and:

- Use HTTPS.
- Set a strong `JWT_SECRET`.
- Restrict PostgreSQL access to the API host only.
- Do not commit `.env` or `.env.local` to Git.

## Verification Checklist

- [ ] PostgreSQL is running and `kitchen_pos` database exists
- [ ] `.env` and `.env.local` are configured
- [ ] `npm run db:migrate` succeeds
- [ ] `npm run db:seed` succeeds
- [ ] `GET http://localhost:3001/health` returns `{"status":"ok"}`
- [ ] Login with `admin/admin` works
- [ ] Products load from the API
- [ ] Creating an order writes to PostgreSQL
- [ ] Offline mode falls back to IndexedDB and syncs when the API is back

## Troubleshooting

### API cannot connect to PostgreSQL

- Verify the `DATABASE_URL` username, password, host, port, and database name.
- Ensure PostgreSQL is listening on `localhost:5432` (or update the URL).
- On Windows, check that the PostgreSQL service is running.

### Frontend cannot reach the API

- Confirm `NEXT_PUBLIC_API_URL` matches the API host and port.
- Check the browser console for CORS errors; the API allows all origins by default in development.
- If accessing from another device, ensure the API binds to `0.0.0.0` and the firewall allows port `3001`.

### Build errors

- Run `npm install` again to ensure Prisma Client is generated.
- If `@prisma/client` seems missing, run `npx prisma generate`.

## Support

- Next.js Documentation: https://nextjs.org/docs
- Prisma Documentation: https://prisma.io/docs
- PostgreSQL Documentation: https://www.postgresql.org/docs/
