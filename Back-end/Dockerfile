FROM php:8.2-apache

# Enable commonly used PHP extensions
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Fix "More than one MPM loaded": keep only prefork, enable rewrite
RUN a2dismod mpm_event mpm_worker 2>/dev/null || true \
    && a2enmod mpm_prefork rewrite

# Copy source code to the container
COPY . /var/www/html/

# Set permissions
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80

# Listen on Railway's PORT (falls back to 80 locally)
CMD ["sh", "-c", "sed -i \"s/80/${PORT:-80}/g\" /etc/apache2/ports.conf /etc/apache2/sites-available/000-default.conf && apache2-foreground"]