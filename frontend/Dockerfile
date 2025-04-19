# Nginx base image
FROM nginx:alpine
# Copy static files
COPY index.html /usr/share/nginx/html/
COPY style.css /usr/share/nginx/html/
COPY script.js /usr/share/nginx/html/
# Copy Nginx config
COPY nginx.conf.local /etc/nginx/conf.d/default.conf
# Expose port 80
EXPOSE 80
# Start Nginx
CMD ["nginx", "-g", "daemon off;"]