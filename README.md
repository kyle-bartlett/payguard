# PayGuard

PayGuard extracts pay-statement fields with the OpenAI Responses API, then applies deterministic federal and state wage rules. Visitors can also run a preloaded demo without uploading personal data.

## Local Development

Copy `.env.example` to `.env`, add `OPENAI_API_KEY`, and generate an auth secret with `openssl rand -hex 32`, then run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000/worker/upload](http://localhost:3000/worker/upload). Live analysis accepts one PDF, PNG, JPG, or WebP file up to 10 MB. The Demo button does not call the API.

## Verification

```bash
npm test
npm run lint
npm run build
```

## Production

PayGuard deploys from Forgejo `main` through Coolify at [payguard.bartlettlabs.io](https://payguard.bartlettlabs.io). Configure these environment variables in Coolify:

- `DATABASE_URL`
- `AUTH_SECRET` (at least 32 characters)
- `OPENAI_API_KEY`
- `OPENAI_PAYGUARD_MODEL` (optional; defaults to `gpt-5.6-luna`)
