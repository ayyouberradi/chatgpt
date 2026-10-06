# Deploy updates from GitHub to Hostinger

The workflow builds React and Laravel's production dependencies, runs the type check and backend tests, then updates the existing Hostinger site over SSH. Deployments are started manually through Actions → Deploy to Hostinger → Run workflow. Pushes alone do not deploy.

The updater preserves the live `.env`, SQLite database, all storage files, application key, administrator accounts, and existing media symlink. It creates a consistent SQLite backup under `laravel/storage/app/deployment-backups` before migrations and uses Laravel maintenance mode during the update. It does not re-seed the database. Old hashed frontend assets remain available for already-open browser tabs. A failed update is reported by Actions; database backups are retained, but automatic code rollback is not provided. SSH and rsync must be available on the hosting account.

## One-time SSH setup from your Mac

Open a new local Terminal tab, outside the Hostinger SSH session:

```sh
ssh-keygen -t ed25519 -C "github-hostinger-deploy" -f ~/.ssh/hostinger_github
```

For this dedicated automation key, leave the passphrase empty when prompted. Keep the key file private. Add its public key to the hosting account:

```sh
cat ~/.ssh/hostinger_github.pub | ssh -p 65002 u808335549@92.113.18.197 'umask 077; mkdir -p ~/.ssh; cat >> ~/.ssh/authorized_keys; chmod 700 ~/.ssh; chmod 600 ~/.ssh/authorized_keys'
ssh -i ~/.ssh/hostinger_github -o BatchMode=yes -p 65002 u808335549@92.113.18.197 'php -v; command -v rsync'
```

The first command uses the Hostinger password to authorize the public key. The second must succeed without asking for that password and must show PHP 8.4+ and an rsync path. The deployment key has the hosting user's permissions; use it only for this repository and remove its authorized-key entry if you stop using it.

## GitHub secrets

Open the repository → Settings → Secrets and variables → Actions → New repository secret.

1. `HOSTINGER_SSH_KEY`: copy the private key directly to your clipboard using `pbcopy < ~/.ssh/hostinger_github`, then paste into the GitHub secret field.
2. `HOSTINGER_KNOWN_HOSTS`: copy the server key already trusted during your successful SSH login:

```sh
ssh-keygen -F '[92.113.18.197]:65002' -f ~/.ssh/known_hosts | sed '/^#/d' | pbcopy
```

Paste into the second GitHub secret field. If this produces no content, check the existing SSH host-key record before proceeding. Do not disable host-key checking. Do not send either secret in chat or commit it to Git.

Then open Actions → Deploy to Hostinger → Run workflow → choose `main`. Wait for the tests, upload, update and live checks to pass. Check the website, administrator login, a saved setting and media upload afterward. This workflow is prepared; deployment is not connected until the SSH key is authorized and both secrets are set.

Host and path settings are currently configured for `salmon-turtle-767162.hostingersite.com` and the account used in this setup. Update the workflow and server script when changing accounts or deployment paths. Keep database backups and monitor disk space because retained backups, uploaded release folders and old frontend assets accumulate.
