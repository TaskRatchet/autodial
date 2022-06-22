# autodial

## Local Development

- Copy `.env.example` to `.env` and set variables
- `npx netlify link`
- `npm run netlify`
- Open <http://localhost:8888/>

### Creating your Beeminder test client

- Go to your [account settings](https://www.beeminder.com/settings/account)
- At the bottom of the page, click "Register a new app"
- Name it something like `bm_autodial_dev`
- Use `http://localhost:8888` as the redirect and post-deauthorize callback urls
- Copy the client ID into your `.env.local` file

### Cloud Functions

Install the global `firebase` CLI:

```bash
npm install -g firebase-tools
```

Login with `taskratchet@gmail.com`:

```bash
firebase login
```

Run tests:

```bash
cd functions/
npm run test
```

Serve the function locally:

```bash
firebase serve --only functions
```

## Todos

- Set up automatic functions deploy via gh actions on master branch
- Set up cron trigger on gcp function via gcp scheduler
- Require CI test passes for merge to master
- Consider using a tool for monorepo management, such as [TurboRepo][1], [Lerna][2], or [TSDX][3]

[1]: https://turborepo.org/
[2]: https://lerna.js.org/
[3]: https://github.com/jaredpalmer/tsdx
