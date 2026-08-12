# Portfolio visit counter

Cloudflare Worker and SQLite-backed Durable Object for the public counter shown on `profile.html`.

## Deploy

```powershell
npx wrangler login
npx wrangler deploy
```

The Worker is configured for `https://counter.avagianos-dev.gr/api/visits`.
It accepts reads and increments only from the portfolio's approved origins.
