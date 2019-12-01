FROM node:11

RUN npm i -g yarn

RUN npm i -g typescript

COPY . /opt/tally-bot

# remove env file just in case we are building in dev
RUN rm -f .env

RUN cd /opt/tally-bot && yarn install && tsc

WORKDIR /opt/tally-bot

ENTRYPOINT ["yarn", "start"]