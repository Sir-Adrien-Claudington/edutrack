# EduTrack Operations Runbook

## Deployment (Railway)

```bash
# Deploy latest master branch
railway up --detach

# Check live logs
railway logs

# Check environment variables
railway variables

# Set a variable
railway variables set KEY=value
```

## Rollback procedure

### Option A — Code rollback (most common)

1. Find the last good commit:

   ```bash
   git log --oneline -10
   ```

2. Create a rollback commit (preferred over `git revert` for speed):

   ```bash
   git revert HEAD --no-edit
   git push
   ```

   Railway auto-deploys on push.

3. Verify the deploy in Railway dashboard → **Deployments** → confirm new deploy goes green.

### Option B — Force-rollback to a specific commit

```bash
git checkout <good-commit-sha> -- server/
git add server/
git commit -m "rollback: revert server to <sha>"
git push
```

### Option C — Railway instant rollback (no code change)

1. Railway dashboard → **Deployments**
2. Find the last successful deployment
3. Click **Redeploy** on that entry

Note: this redeploys the previously built image without running migrations.

## Database rollback

> Prisma does not auto-rollback schema changes. Follow these steps carefully.

### Roll back the latest migration

```bash
# Connect to the Railway Postgres instance
railway connect Postgres

# Manually reverse the migration SQL (see down.sql next to each migration.sql)
\i server/prisma/migrations/<migration-folder>/down.sql

# Then remove the migration record so Prisma won't think it's applied
DELETE FROM "_prisma_migrations" WHERE migration_name = '<migration-folder>';

# Exit psql
\q
```

### Regenerate the Prisma client after schema rollback

```bash
npx prisma generate --schema=server/prisma/schema.prisma
```

## Post-deploy walk-through

After every Railway deployment, run this checklist before closing the deploy tab:

1. Hit `/health`: `curl https://edutrack-production-2a6d.up.railway.app/health`  
   Expected: `{"status":"ok", ...}`
2. Open the app URL, log in as a teacher — confirm the dashboard loads and classrooms appear.
3. Open the app as a student — confirm assignments list loads.
4. Check Railway logs (`railway logs`) for any ERROR lines during the first 60 seconds.
5. If Sentry is configured, verify no new issues appeared in the Sentry dashboard.

## Performance targets

| Metric                | Target  |
| --------------------- | ------- |
| API p95 response time | < 500ms |
| AI insight generation | < 5s    |
| Health check          | < 100ms |

Monitor via Railway Metrics tab. Alert if p95 API latency exceeds 500ms for more than 5 minutes.

## Environment secrets rotation

| Secret                 | Rotation cadence                   | Procedure                                                                                    |
| ---------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------- |
| `JWT_SECRET`           | 180 days                           | Generate new → set in Railway → redeploy. All sessions invalidated on next refresh.          |
| `JWT_REFRESH_SECRET`   | 180 days                           | Same as above.                                                                               |
| `ANTHROPIC_API_KEY`    | On suspected exposure, or annually | Rotate in Anthropic console → update Railway var.                                            |
| `GOOGLE_CLIENT_SECRET` | On suspected exposure              | Rotate in Google Cloud Console → update Railway var.                                         |
| `SENTRY_DSN`           | On org/project deletion            | Update in Sentry project settings → update Railway var.                                      |
| `DATABASE_URL`         | On suspected exposure              | Rotate credentials in Neon dashboard → update Railway var. Run smoke test immediately after. |

Rotate `JWT_SECRET` and `JWT_REFRESH_SECRET` every **180 days**.

1. Generate new secrets:

   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. Set in Railway:

   ```bash
   railway variables set JWT_SECRET=<new> JWT_REFRESH_SECRET=<new>
   ```

3. Deploy to pick up new secrets:

   ```bash
   railway up --detach
   ```

4. All active sessions will be invalidated on the next token refresh (since old JWTs will fail verification).

## Health check

```bash
curl https://edutrack-production-2a6d.up.railway.app/health
# Expected: {"status":"ok","timestamp":"...","environment":"production"}
```

## Prisma Studio (inspect live DB)

```bash
DATABASE_URL=$(railway variables get DATABASE_URL) npx prisma studio --schema=server/prisma/schema.prisma
```
