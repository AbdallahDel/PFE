FROM php:8.2-apache

RUN docker-php-ext-install mysqli pdo pdo_mysql

# Remove every MPM, then enable only prefork
RUN rm -f /etc/apache2/mods-enabled/mpm_*.load /etc/apache2/mods-enabled/mpm_*.conf \
    && ln -s /etc/apache2/mods-available/mpm_prefork.load /etc/apache2/mods-enabled/mpm_prefork.load \
    && ln -s /etc/apache2/mods-available/mpm_prefork.conf /etc/apache2/mods-enabled/mpm_prefork.conf \
    && a2enmod rewrite

COPY . /var/www/html/
RUN chown -R www-data:www-data /var/www/html

# Run cors.php before every PHP script
RUN echo "auto_prepend_file=/var/www/html/cors.php" > /usr/local/etc/php/conf.d/zz-cors.ini

EXPOSE 80

# Re-apply the MPM fix at startup, then follow Railway's PORT
CMD ["sh", "-c", "rm -f /etc/apache2/mods-enabled/mpm_event.* /etc/apache2/mods-enabled/mpm_worker.* && sed -i \"s/80/${PORT:-80}/g\" /etc/apache2/ports.conf /etc/apache2/sites-available/000-default.conf && apache2-foreground"]