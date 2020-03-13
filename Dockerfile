FROM nginx:latest

COPY ./default.conf /etc/nginx/conf.d/default.conf

COPY -R ./static /usr/share/nginx/html/
COPY ./index.html /usr/share/nginx/html
COPY ./index.js /usr/share/nginx/html

CMD ["nginx","-g","daemon off;"]