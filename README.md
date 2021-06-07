# autodial

## Local Development

- Copy `.env.local.example` to `.env.local` and set variables
- Run `npm run start`
- Open <http://localhost:3000/>

### Creating your Beeminder test client

- Go to your [account settings](https://www.beeminder.com/settings/account)
- At the bottom of the page, click "Register a new app"
- Name it something like `bm_autodial_dev`
- Use `http://localhost:3000` as the redirect and post-deauthorize callback urls
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

## Todos

- Fix function tests
- Set up automatic functions deploy via gh actions on master branch
- Set up automatic web deploy via netlify on master branch
- Set up cron trigger on gcp function via gcp scheduler
