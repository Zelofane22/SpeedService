#!/bin/sh
set -e

# Railway injects PORT; default to 80 for local Docker
PORT=${PORT:-80}
sed -i "s/\${PORT}/$PORT/" /etc/nginx/sites-available/default

# Install deps if vendor missing (dev/CI fallback)
if [ ! -f "vendor/autoload.php" ]; then
    composer install --no-interaction --prefer-dist --optimize-autoloader --no-dev
fi

mkdir -p storage/framework/views storage/framework/cache/data storage/framework/sessions storage/logs
chown -R www-data:www-data storage bootstrap/cache

php artisan migrate --force
php artisan storage:link --force 2>/dev/null || true
php artisan config:cache
php artisan route:cache
php artisan view:cache

exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
