#!/bin/sh

export REACT_APP_NGINXPROXY

envsubst '${REACT_APP_NGINXPROXY}' < /etc/nginx/conf.d/todo_app_container_nginx_server.conf.template > /etc/nginx/conf.d/todo_app_container_nginx_server.conf

exec "$@"