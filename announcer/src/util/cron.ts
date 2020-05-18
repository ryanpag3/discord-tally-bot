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

const myEventQueue = new Queue('tallybot.announcer.events', {
    redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT  
    }
});



export default class Cron {
    static bot: Client;

    static async setBot(bot: Client) {
        Cron.bot = bot;
    }

    static startListeningForEvents() {
        myEventQueue.process((job) => Cron.handleAnnounceAlertEvent(job));
    }

    static async initializeJobs(jobsPayload: string) {
        if (!jobsPayload) return;
        const parsed = JSON.parse(jobsPayload);
        const keys = Object.keys(parsed);
        await Cron.clearCronCache();
        const promises = [];
        for (const key of keys) {
            const { id, name, description, channelId, date, isAlert } = parsed[key];
            promises.push(Cron.createCronJob(id, name, description, channelId, date, isAlert));
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

    static async createCronJob(id, name, description, channelId, date, isAlert) {
        let repeating = true;

        const timestamp = Date.parse(date);
        if (isNaN(timestamp) === false) {
            repeating = false;
            date = new Date(timestamp);
        }

        try {
            if (cronCache[id]) {
                await cronCache[id].stop();
                delete cronCache[id];
            }
            cronCache[id] = new CronJob(
                date,
                () => {
                    if (isAlert) return Cron.announceAlert(id);
                    Cron.announce(id, name, description, channelId);
                    if (!repeating) Cron.destroyCronJob(id, name, channelId);
                },
                null,
                true,
                'America/Los_Angeles'
            );
            logger.debug(`created new cron job for ${name} on ${channelId} at ${date}`);
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

    static async announceAlert(id: string) {
        const msg = {
            type: 'announcement.alert',
            body: {
                id
            }
        };
        eventQueue.add(msg);
    }

    static async handleAnnounceAlertEvent(job: any) {
        try {
            const { announcement, tallies } = job.data;
            const { channelId } = tallies[0];
            const channel: any = await this.bot.channels.find((x) => x.id === channelId);
            const richEmbed = Cron.getRichEmbed();
            richEmbed.setTitle(`Tally Alert Announcement`);
            richEmbed.setDescription(`Announcement - **${announcement.name}**\nSchedule - **${announcement.datePattern}**`);
            for (const t of tallies) {
                richEmbed.addField(`name: ${t.name}`,`count: ${t.count}`);
            }
            channel.send(richEmbed);
        } catch (e) {
            logger.error(`Could not run tally alert announcement.`, e);
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
