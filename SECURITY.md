# Security Notes

## Secrets and Configuration

- Never commit real `.env` files or credentials.
- Use `.env.example` and `backend/.env.example` as templates.
- Set `JWT_SECRET` to a strong random value (at least 32 characters).
- Keep `DB_SYNCHRONIZE=false` in production.
- Restrict `FRONTEND_ORIGIN` to trusted domains only.

## Frontend Keys

- Google Maps and Google client IDs are public configuration values and must be restricted in provider console.
- Do not hardcode keys in source files.
- Configure keys via environment replacement during CI/CD.

## API Hardening

- Global validation pipe is enabled with whitelist and non-whitelisted field rejection.
- Rate limiting is enabled with `THROTTLE_TTL` and `THROTTLE_LIMIT`.
- Helmet security headers are enabled.
- Global exception filter avoids leaking internal server error details.

## Dependency Hygiene

- Run these before release:
  - `npm audit --omit=dev` (frontend and backend)
  - `npm outdated`
  - patch/minor upgrades where possible
- Track high severity advisories and upgrade major framework versions in a planned release window.

## Release Checklist

- Rotate all secrets before publishing repository.
- Remove local database users/passwords from local config.
- Confirm no API keys are hardcoded.
- Build and smoke test production targets.
