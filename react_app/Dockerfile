# first building react project, using node base image
FROM node:10 as build-stage

WORKDIR /react-app

# required to install packages
COPY ./package.json /react-app/

# installing npm packages
RUN npm install

COPY ./ /react-app/

# creating production build to serve through nginx
RUN env &&\
    npm run build

# starting second, nginx build-stage
FROM nginx:1.19

# copying our nginx config
COPY --from=build-stage /react-app/todo_app_container_nginx_server.conf /etc/nginx/conf.d/default.conf

# copying production build from last stage to serve through nginx
COPY --from=build-stage /react-app/build/ /usr/share/nginx/html

# exposing port 3000 on container
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]