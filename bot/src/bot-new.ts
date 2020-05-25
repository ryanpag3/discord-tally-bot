require('dotenv').config();
import { Client } from 'discord.js';
import HealthCheckServer from './util/healthcheck-server';
import CommandManager from './message/command-manager';
import disabledEvents from './events/disabled';
import Env from './util/env';
import DBLAPI from 'dblapi.js';
import logger from './util/logger';
import DB from './util/db';
import KeywordUtil from './util/keyword-util';
import onReady from './events/ready';
import onMessage from './events/message';
import onGuildCreate from './events/guild-create';
import onError from './events/error';
import onWarn from './events/warn';
import onReconnecting from './events/reconnecting';
import onResume from './events/resume';
import onDisconnect from './events/disconnect';

const shardId: number = Number.parseInt(process.env.SHARD_ID) || 0;
const shardCount: number = Number.parseInt(process.env.SHARD_COUNT) || 1;

const client = new Client({
    messageCacheLifetime: 60,
    messageSweepInterval: 5 * 60,
    shardId,
    shardCount,
    // @ts-ignore
    disabledEvents,
});

const healthcheck: HealthCheckServer = new HealthCheckServer(client);
const commandManager: CommandManager = new CommandManager(client);
const topgg = Env.isProduction()
    ? new DBLAPI(process.env.DBOTS_TOKEN, client)
    : undefined;
const db: DB = new DB();

async function startUp() {
    try {
        logger.info(`Starting tally bot.`);
        await setup();
        await client.login(process.env.DISCORD_TOKEN);
        await healthcheck.start();
    } catch (e) {
        logger.error(`An error occured while starting up tally bot.`, e);
    }
}

async function setup() {
    await db.init();
    await KeywordUtil.loadKeywordServersToCache();
    await setupBotEventHandlers();
}

async function setupBotEventHandlers() {
    client.on('ready', onReady);
    client.on('error', onError);
    client.on('warn', onWarn);
    client.on('reconnecting', onReconnecting);
    client.on('resume', onResume);
    client.on('disconnect', onDisconnect);
    client.on('message', onMessage);
    client.on('guildCreate', onGuildCreate);
}

startUp();
