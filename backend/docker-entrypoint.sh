#!/bin/sh
set -e

# Install composer dependencies if vendor is missing (volume mount overrides image)
if [ ! -f "vendor/autoload.php" ]; then
    echo "Installing Composer dependencies..."
    composer install --no-interaction --prefer-dist --optimize-autoloader
fi

exec php artisan serve --host=0.0.0.0 --port=8000
