#!/bin/bash

set -x

docker rm -f muvel-server
echo Deleted previous container

docker build -t muvel-server .

docker run -it -d --name muvel-server -v $PWD/data:/app/server/.tmp -p 127.0.0.1:1338:1337 --env-file .env muvel-server

echo Done!