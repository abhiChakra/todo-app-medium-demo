# first building react project, using node base image
FROM node:10 as build-stage

WORKDIR /react-app

# required to install packages
COPY ./package.json /react-app/

# installing npm packages
RUN npm install

# collecting proxy env var

ARG REACT_APP_NGINXPROXY

ENV REACT_APP_NGINXPROXY $REACT_APP_NGINXPROXY

COPY ./ /react-app/

# creating production build to serve through nginx
RUN env &&\
    npm run build

# starting second, nginx build-stage
FROM nginx:1.19

# copying our nginx config
COPY --from=build-stage /react-app/todo_app_container_nginx_server.conf.template /etc/nginx/conf.d/

COPY --from=build-stage /react-app/nginxPop.sh /etc/nginx/conf.d/

RUN rm /etc/nginx/conf.d/default.conf

# copying production build from last stage to serve through nginx
COPY --from=build-stage /react-app/build/ /usr/share/nginx/html

# exposing port 3000 on container
EXPOSE 8080

RUN chmod 777 /etc/nginx/conf.d/nginxPop.sh

ENTRYPOINT ["/etc/nginx/conf.d/nginxPop.sh"]

CMD ["nginx", "-g", "daemon off;"]