FROM php:8.4-fpm
WORKDIR /var/www/html
RUN apt-get update && apt-get install -y git unzip libpq-dev zip
RUN docker-php-ext-install pdo pdo_pgsql
RUN php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" && php composer-setup.php --install-dir=/usr/local/bin --filename=composer
COPY composer.json composer.lock* ./
RUN composer install --no-interaction --prefer-dist --optimize-autoloader --no-scripts
COPY . .
RUN composer run-script post-autoload-dump --no-interaction || true
RUN chmod +x docker-entrypoint.sh
EXPOSE 8000
ENTRYPOINT ["sh", "./docker-entrypoint.sh"]
