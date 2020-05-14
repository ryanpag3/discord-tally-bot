import dotenv from 'dotenv';
import Discord, { Client } from 'discord.js';
dotenv.config();

import logger from './util/logger';
import Redis from './util/redis';
import Cron from './util/cron';

class AnnouncerBot {
    token: string;
    client: Client = new Discord.Client({
        messageCacheLifetime: 60,
        messageSweepInterval: 5 * 60,
        disabledEvents: [
            'GUILD_SYNC',
            'GUILD_UPDATE',
            'GUILD_MEMBER_ADD',
            'GUILD_MEMBER_REMOVE',
            'GUILD_MEMBER_UPDATE',
            'GUILD_INTEGRATIONS_UPDATE',
            'GUILD_ROLE_CREATE',
            'GUILD_ROLE_DELETE',
            'GUILD_ROLE_UPDATE',
            'MESSAGE_DELETE_BULK',
            'MESSAGE_REACTION_ADD',
            'MESSAGE_REACTION_REMOVE',
            'MESSAGE_REACTION_REMOVE_ALL',
            'USER_UPDATE',
            'USER_NOTE_UPDATE',
            'USER_SETTINGS_UPDATE',
            'PRESENCE_UPDATE',
            'VOICE_STATE_UPDATE',
            'TYPING_START',
            'VOICE_SERVER_UPDATE',
            'RELATIONSHIP_ADD',
            'RELATIONSHIP_REMOVE',
            'WEBHOOKS_UPDATE'
        ]
    });
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

