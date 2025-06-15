FROM php:8.2-apache

# Enable commonly used PHP extensions
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Enable Apache mod_rewrite if you're using .htaccess or routing
RUN a2enmod rewrite

# Copy source code to the container
COPY . /var/www/html/

# Optional: Set working directory permissions
RUN chown -R www-data:www-data /var/www/html

# Optional: Custom Apache config (if needed)
# COPY apache-config.conf /etc/apache2/sites-available/000-default.conf

EXPOSE 80
