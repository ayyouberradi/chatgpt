# Ayoub Erradi website — Laravel edition

The supplied React design, routes, animations, theme switching, portfolio, case studies, contact flow, and admin interface are retained. Laravel 12 replaces Supabase authentication, shared content persistence, and media storage. SQLite is configured for local development. The original archive is kept separately and unchanged.

## Setup

Requires PHP 8.4+ (the dependency lock targets PHP 8.4), Composer 2, Node.js 20.19+ and npm. Enable PHP intl, mbstring, XML/DOM, PDO SQLite, curl, zip, tokenizer, ctype, fileinfo and iconv. The cloud workspace includes a verified PHP runtime and Composer under `/workspace/toolchain`; `scripts/setup.sh` uses them automatically.

From the project root:

```sh
bash scripts/setup.sh
cd backend
php artisan admin:create you@example.com
php artisan serve --host=127.0.0.1 --port=8000 --no-reload
```

In this cloud environment, add `/workspace/toolchain/bin` to `PATH` before running PHP directly. The admin command securely prompts for a password of at least 12 characters. There is no public registration or default administrator. Sign in at `/admin/login`.

For frontend development, start Laravel on port 8000, then run `npm run dev` from `frontend`. Vite proxies `/api` and `/storage` to Laravel. `node scripts/build.mjs` builds and copies the frontend to Laravel's public directory for serving together.

Setup is repeatable: it preserves an existing application key, database content and uploaded media. Seeding inserts the supplied content only when the settings row is absent.

## Validation

```sh
cd frontend
npm run typecheck
cd ../backend
php artisan test
```

Feature tests cover authentication, protected writes, public visibility, content persistence and deletion, validation, and media upload/list/delete. Browser checks additionally exercised public routes, session login/reload, content writes, upload retrieval and deletion, and CSRF rejection against a running server.

## Backend behavior

- `GET /api/session`, `POST /api/login`, `POST /api/logout`: cookie session authentication, CSRF protection and login throttling.
- `GET /api/settings`: seeded site content; inactive entries are filtered for visitors.
- Authenticated `PATCH /api/settings` and `PUT /api/settings/{collection}`: persistent settings and collection updates. Collections are updated independently to avoid overwriting unrelated edits.
- Authenticated `/api/media`: list, upload and delete. Uploaded files have generated names, a 20 MB limit, and an allowlist of raster image/video formats. SVG uploads are deliberately excluded because they can execute scripts when served.

Content uses a JSON document matching the existing admin application's data structures. Supabase realtime subscriptions are removed; visitors receive current content on page load. Saves update the UI after the server accepts the change and display failures. Booking requests and contact enquiries are saved as leads before WhatsApp opens with their full details. The client taps Send in WhatsApp; requested appointments await confirmation. There is no email delivery or external calendar integration. Existing analytics integrations and remote image URLs remain part of the supplied frontend. No live Supabase database or media export was included; initial content comes from the archive's bundled data.

## Deployment

Build with `node scripts/build.mjs`. Serve `backend/public` through a PHP-capable web server. Configure `backend/.env` for your actual domain, set `APP_ENV=production`, `APP_DEBUG=false`, and `SESSION_SECURE_COOKIE=true` under HTTPS. Keep `.env`, SQLite and `storage/app/public` outside source control and back up the database and uploaded media. Run migrations and create your administrator on the deployment machine. Set `APP_URL` to the live domain; media URLs are relative for the same-origin deployment.

The Composer lock uses GitHub codeload URLs pinned to the original package commit references because the cloud proxy blocked GitHub API zipball requests. TLS and package verification remain enabled.

## GitHub deployment

See [GITHUB-DEPLOYMENT.md](GITHUB-DEPLOYMENT.md) for the manual GitHub Actions workflow, SSH key setup and update safeguards for the existing Hostinger site.

## Business administration

The Laravel / Filament business panel at `/manage` uses the existing administrator login and adds enquiry capture, clients, scoped services, quotes, contracts, invoices, credit notes, PDF downloads, and recorded payments. See [BUSINESS-ADMIN.md](BUSINESS-ADMIN.md) for configuration and workflows, and [WEBSITE-REVIEW.md](WEBSITE-REVIEW.md) for the review and roadmap. PHP 8.4+ and the intl extension are required.
