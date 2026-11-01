# Dorothy AI worker (optional, free)

Dorothy AI works fully in the browser without this. The worker only *rephrases* the verified
passages the browser already found, so answers read more naturally. It cannot add new facts.

## Deploy on Cloudflare's free plan

1. Create a free Cloudflare account.
2. From this folder:
   ```bash
   npx wrangler login
   ```
   ```bash
   npx wrangler deploy
   ```
3. Copy the URL it prints (e.g. `https://dorothy-ai.<you>.workers.dev`) into `aiEndpoint` in `js/config.js`.
4. Set `ALLOWED_ORIGINS` in `wrangler.toml` to your real domain(s).

Workers AI includes a daily free allowance. If it is exceeded or fails, the site silently falls
back to showing the verified passage, so visitors never see an error.
Update the privacy page before enabling this, as it promises.
