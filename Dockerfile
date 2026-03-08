FROM node:24

# install ffmpeg
RUN apt-get update && apt-get install -y ffmpeg

WORKDIR /home/node/app
