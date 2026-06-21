FROM php:8.4-fpm
WORKDIR /var/www/html
RUN apt-get update && apt-get install -y git unzip libpq-dev zip
RUN docker-php-ext-install pdo pdo_pgsql
COPY composer.json composer.lock* ./
RUN php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" && php composer-setup.php --install-dir=/usr/local/bin --filename=composer
RUN composer install --no-interaction --prefer-dist --optimize-autoloader
COPY . .
EXPOSE 8000
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
