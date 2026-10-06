# Hostinger test deployment

This release keeps Laravel outside the publicly accessible folder. It contains production Composer dependencies and the compiled React site. It contains no credentials, application key, uploaded media, or populated database.

## Shared PHP hosting with SSH

Use a test subdomain with HTTPS and PHP 8.4 enabled in hPanel. Enable the PHP extensions listed in README.md. Locate the test domain directory containing its `public_html` folder. Back up any existing site first.

Upload and extract `chatgpt-hostinger.zip` there, so its `laravel` and `public_html` directories are siblings. The `laravel` folder must remain outside `public_html`. Do not replace an existing site's files without a backup. The release's bootstrap and public entrypoint already use this directory layout.

Connect through the SSH access details provided by hPanel and run from the uploaded `laravel` folder:

```sh
cp .env.example .env
# Edit .env securely: set APP_URL to the exact HTTPS test domain.
php artisan key:generate --force
php artisan migrate --seed --force
php artisan storage:link
php artisan admin:create your-email@example.com
php artisan config:cache
```

Check that `php -v` is PHP 8.4 or newer; the CLI and website PHP versions may differ. Use Hostinger's PHP 8.4 CLI path if necessary. Keep `.env` private. Laravel needs write access to `storage`, `bootstrap/cache`, and the SQLite database directory; use permissions suitable for the hosting account, never 777.

Verify `/up`, `/api/settings`, the home page, `/portfolio`, and `/admin/login`. Sign in, change a setting, reload it, then upload and delete a media file. Check HTTPS cookies and `/storage/media/...` retrieval. This package is prepared locally; these checks must still be run on Hostinger before calling the deployment successful.

If the plan has no SSH, a different deployment route is required to securely initialize the key, database, storage link and admin account. Do not expose a web-based installer to work around that limitation.

## Link the repository

Use Hostinger's Git feature only if it is available on your plan. A normal Git checkout of this repository does not have the upload release's sibling folder layout. Clone the repository outside `public_html`, run `bash scripts/setup.sh` with PHP 8.4, Composer and Node available, and configure the domain's document root to the checkout's `backend/public` directory if your plan supports it. Set the production `.env` and run the initialization commands above.

For private repositories, configure the deployment key provided by Hostinger in GitHub according to hPanel's Git setup flow. Do not enter private keys, passwords or tokens into chat. Push the project source to GitHub before connecting it: the current migration files have not been pushed by this assistant.

If the hosting plan cannot change the document root or run the build tools, use the prepared upload release for the test deployment. A VPS can support a full Git deployment with a PHP web server and persistent database/media directories.
