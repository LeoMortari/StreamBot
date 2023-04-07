FROM ghcr.io/puppeteer/puppeteer:latest

USER root

WORKDIR /usr/src/app

ENV DISPLAY=:0
ENV LIBGL_ALWAYS_SOFTWARE=1

RUN apt-get update && apt-get install -y \
    xvfb \
    chromium

COPY package*.json ./

RUN npm install

USER pptruser

COPY . .

CMD ["xvfb-run", "npm", "start"]
