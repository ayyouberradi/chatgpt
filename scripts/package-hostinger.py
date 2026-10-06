#!/usr/bin/env python3
"""Prepare a release with Laravel outside the public document root."""
from pathlib import Path
import os, shutil, subprocess, tempfile, zipfile
root = Path(__file__).resolve().parent.parent
release = Path(tempfile.mkdtemp(prefix='hostinger-release-'))
app = release / 'laravel'
shutil.copytree(root / 'backend', app, ignore=shutil.ignore_patterns('vendor', '.env', '*.sqlite*', '*.log', '.git', 'node_modules', 'tests', '.github'))
for relative in ['bootstrap/cache', 'storage/framework/cache/data', 'storage/framework/views', 'storage/framework/sessions', 'storage/framework/testing', 'storage/app/public/media']:
    folder = app / relative
    if folder.exists(): shutil.rmtree(folder)
    folder.mkdir(parents=True)
    (folder / '.gitignore').write_text('*\n!.gitignore\n')
public = release / 'public_html'
shutil.copytree(root / 'backend/public', public, ignore=shutil.ignore_patterns('storage'))
shutil.rmtree(app / 'public')
bootstrap = app / 'bootstrap/app.php'
bootstrap.write_text(bootstrap.read_text().replace('return Application::configure', '$app = Application::configure') + "\n$app->usePublicPath(dirname(__DIR__, 2).'/public_html');\nreturn $app;\n")
index = public / 'index.php'
index.write_text(index.read_text().replace("__DIR__.'/../storage/", "__DIR__.'/../laravel/storage/").replace("__DIR__.'/../vendor/", "__DIR__.'/../laravel/vendor/").replace("__DIR__.'/../bootstrap/", "__DIR__.'/../laravel/bootstrap/"))
example = app / '.env.example'
example.write_text(example.read_text().replace('APP_ENV=local', 'APP_ENV=production').replace('APP_DEBUG=true', 'APP_DEBUG=false').replace('APP_URL=http://127.0.0.1:8000', 'APP_URL=https://your-test-domain.example') + '\nSESSION_SECURE_COOKIE=true\n')
(app / 'database/database.sqlite').touch()
environment = os.environ.copy()
if Path('/workspace/toolchain/bin/php').exists(): environment['PATH'] = '/workspace/toolchain/bin:' + environment['PATH']
composer = ['composer'] if shutil.which('composer') else ['php', '/workspace/toolchain/composer.phar']
subprocess.run(composer + ['install', '--no-dev', '--prefer-dist', '--no-interaction', '--optimize-autoloader'], cwd=app, env=environment, check=True)
shutil.copy2(root / 'HOSTINGER.md', release / 'HOSTINGER.md')
out = root.parent / 'chatgpt-hostinger.zip'
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as archive:
    for file in release.rglob('*'):
        if file.is_file() and not file.is_symlink(): archive.write(file, file.relative_to(release))
print('Release directory:', release)
print('Upload archive:', out)
