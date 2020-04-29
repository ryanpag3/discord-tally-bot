import dotenv from 'dotenv';
import Discord, { Client } from 'discord.js';
dotenv.config();

import logger from './util/logger';
import Redis from './util/redis';
import Cron from './util/cron';

class AnnouncerBot {
    token: string;
    client: Client = new Discord.Client();
    announcements;

    constructor(token: string) {
        this.token = token;
    }

    async start() {
        await this.setup();
        this.client.login(this.token);
        // fire up
    }

    async setup() {
        this.setupBotEvents();
        this.startAnnouncementQuery();
        this.startJobsBuilder();
    }

    setupBotEvents() {
        this.client.on('ready', async () => {
            try {
                Cron.setBot(this.client);
                logger.info(`Announcer bot started.`);
            } catch (e) {
                logger.error(`Could not start announcer bot.`, e);
            }
        })
    }

    startAnnouncementQuery() {
        setInterval(async () => {
            this.announcements = await Redis.get('tallybot.announcements');
        }, 1000);
    }

    startJobsBuilder() {
        setInterval(async () => {
            try {
                await Cron.initializeJobs(this.announcements);
            } catch (e) {
                logger.error(`Error while initializing cron jobs`, e);
            }
        }, 2300);
    }
}

const bot = new AnnouncerBot(process.env.DISCORD_TOKEN);
bot.start();

