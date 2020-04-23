FROM node:11

RUN npm i -g yarn

RUN npm i -g typescript

COPY . /opt/tally-bot

# remove env file just in case we are building in dev
RUN rm -f .env

RUN cd /opt/tally-bot && yarn install

WORKDIR /opt/tally-bot

HEALTHCHECK --interval=5s --timeout=2s --retries=6 \
  CMD curl --silent --fail localhost:4200 || exit 1

ENTRYPOINT ["yarn", "start-prod"]