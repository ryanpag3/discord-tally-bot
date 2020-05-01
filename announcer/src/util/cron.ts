import { CronJob } from 'cron';
import Discord from 'discord.js';
import Queue from 'bull';
import moment from 'moment';
import logger from './logger';
import { Client } from 'discord.js';

let cronCache = {};
const eventQueue = new Queue('tallybot.cron.events', {
    redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
    },
});

export default class Cron {
    static bot: Client;

    static async setBot(bot: Client) {
        Cron.bot = bot;
    }

    static async initializeJobs(jobsPayload: string) {
        if (!jobsPayload) return;
        const parsed = JSON.parse(jobsPayload);
        const keys = Object.keys(parsed);
        await Cron.clearCronCache();
        const promises = [];
        for (const key of keys) {
            const { id, name, description, channelId, date } = parsed[key];
            promises.push(Cron.createCronJob(id, name, description, channelId, date));
        }
        await Promise.all(promises);
    }

    static async clearCronCache() {
        const keys = Object.keys(cronCache);
        for (const key of keys) {
            await cronCache[key].stop();
            delete cronCache[key];
        }
    }

    static async createCronJob(id, name, description, channelId, date) {
        let repeating = true;

        const timestamp = Date.parse(date);
        if (isNaN(timestamp) === false) {
            logger.info(date);
            // logger.info(new Date().toLocaleString());
            repeating = false;
            date = new Date(timestamp);
            logger.info(date);
        }

        try {
            if (cronCache[id]) {
                await cronCache[id].stop();
                delete cronCache[id];
            }
            cronCache[id] = new CronJob(
                date,
                () => {
                    Cron.announce(id, name, description, channelId);
                    if (!repeating) Cron.destroyCronJob(id, name, channelId);
                },
                null,
                true,
                'America/Los_Angeles'
            );
            logger.info(`created new cron job for ${name} on ${channelId} at ${date}`);
        } catch (e) {
            logger.error(e);
            Cron.destroyCronJob(id, name, channelId);
        }
    }

    static async destroyCronJob(id: string, name: string, channelId: string) {
        Cron.sendDisableMessage(name, channelId);
        if (!cronCache[id]) return;
        cronCache[id].stop();
        delete cronCache[id];
    }

    static async announce(id, name, description, channelId) {
        try {
            logger.info('announcing');
            const channel: any = await this.bot.channels.find((x) => x.id === channelId);
            if (!channel) {
                throw new Error(`Announcement channel was not found.`);
            }
            const richEmbed = Cron.getRichEmbed()
                .setTitle(`Announcement!`)
                .addField(`Title`, name)
                .addField(`Description`, description || 'none.');
            await channel.send(richEmbed);
        } catch (e) {
            Cron.destroyCronJob(id, name, channelId);
            logger.error(`Could not announce.`, e);
        }
    }

    static getRichEmbed(username?: string) {
        const richEmbed = new Discord.RichEmbed()
            .setTimestamp()
            .setColor('#cf5967');
            // .setColor('#5fcca4');
        if (username)
            richEmbed.setFooter(`${username}`);
        return richEmbed;
    }

    static async sendDisableMessage(name: string, channelId: string) {
        const msg = {
            type: 'announcement.disable',
            body: {
                name,
                channelId,
            },
        };
        await eventQueue.add(msg);
    }
}
