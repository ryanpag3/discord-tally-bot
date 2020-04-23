FROM node:latest

COPY . /

RUN rm -f .env

RUN yarn install

ENTRYPOINT ["yarn", "prod"]