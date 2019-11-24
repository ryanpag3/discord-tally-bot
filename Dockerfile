FROM node:10

RUN npm i -g yarn

RUN npm i -g typescript

COPY . /opt/tally-bot

RUN chmod +x /opt/tally-bot/entrypoint.sh

RUN cd /opt/tally-bot && yarn install && tsc

WORKDIR /opt/tally-bot

ENTRYPOINT ["./entrypoint.sh"]