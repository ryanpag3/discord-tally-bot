FROM node:11

RUN npm i -g yarn

RUN npm i -g typescript

COPY . /opt/announcer

# remove env file just in case we are building in dev
RUN rm -f .env

RUN cd /opt/announcer && yarn install

WORKDIR /opt/announcer

ENTRYPOINT ["yarn", "start"]