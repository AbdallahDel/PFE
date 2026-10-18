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
# Start script (strip Windows line endings, keep it out of the web root)
COPY start.sh /usr/local/bin/start.sh
RUN sed -i 's/\r$//' /usr/local/bin/start.sh && chmod +x /usr/local/bin/start.sh \
    && rm -f /var/www/html/start.sh
    
EXPOSE 80

# Re-apply the MPM fix at startup, then follow Railway's PORT
CMD ["/usr/local/bin/start.sh"]