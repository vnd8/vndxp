# vnd8.site

Portfolio for Anes (@vnd8d). React + Vite front end, Cloudflare Worker API, Cloudflare D1 database.

- `/` the site. Clips and credits come from the database.
- `/admin` add, edit and delete clips and credits, read booking requests.

## One-time Cloudflare setup

```bash
npm install
npx wrangler login
npx wrangler d1 create vndxp            # copy the database_id into wrangler.jsonc
npm run db:migrate                      # creates the tables and loads the existing clips
npx wrangler secret put ADMIN_PASSWORD  # the password for /admin
```

To get a Discord message for every new booking request and drawing, create a webhook in a private
channel (channel settings, Integrations, Webhooks) and store its URL:

```bash
npx wrangler secret put DISCORD_WEBHOOK_URL
npx wrangler secret put DISCORD_MENTION_ID   # optional: your Discord user id, to get pinged
```

After that, pushing to GitHub redeploys through Workers Builds (build command `npm run build`,
deploy command `npx wrangler deploy`), or run `npm run deploy` by hand.

## Local development

```bash
npm run db:migrate:local
npm run dev
```

The local admin password is in `.dev.vars` (not committed): `ADMIN_PASSWORD=...`.
