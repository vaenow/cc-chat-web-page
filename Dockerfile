FROM nginx:latest

COPY ./default.conf /etc/nginx/conf.d/default.conf

COPY ./static /usr/share/nginx/html/static
COPY ./*.html /usr/share/nginx/html
COPY ./*.js /usr/share/nginx/html

CMD ["nginx","-g","daemon off;"]