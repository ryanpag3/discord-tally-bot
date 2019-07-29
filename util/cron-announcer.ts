import {
    CronJob
} from 'cron';
import DB from './db';
import helper from './cmd-helper';

let cronCache = {}; // global singleton cache
let bot;

export default class Cron {
    constructor() {}

    /**
     * initialize cron jobs active in the database
     * this gets run on process boot
     * TODO: scale to multi-node
     */
    static async initCronJobs() {
        const announcements: any = await DB.Announcement.findAll({
            where: {
                active: true
            }
        });
        for (let announce of announcements) {
            let date;
            if (announce.datePattern == null) continue;
            if (isValidDate(announce.datePattern)) date = new Date(announce.datePattern);
            Cron.createCronJob(announce.name, announce.channelId, date || announce.datePattern);
        }

        function isValidDate(d) {
            const ts = Date.parse(d);
            return isNaN(ts) == false;
        }
    }

    static setBot(b) {
        bot = b.bot;
    }

    /**
     * create a cron job or replace existing in cache
     * TODO: timezones
     */
    static async createCronJob(announceName, channelId, date) {
        console.log(`creating new cron job for ${announceName} on ${channelId} at ${date}`);
        let repeating = true;
        if (typeof date !== 'string') repeating = false;
        cronCache[announceName] = new CronJob(date, () => {
            Cron.announce(announceName, channelId);
            if (!repeating) Cron.destroyCronJob(announceName, channelId);
        }, null, true, 'America/Los_Angeles');
    }

    static async destroyCronJob(announceName, channelId) {
        if (!cronCache[announceName]) return;
        console.log(`Destroying cron job for ${announceName}`);
        const announce: any = await DB.Announcement.findOne({ where :{
            channelId: channelId,
            name: announceName
        }});
        if (announce) {
            announce.active = false;
            announce.save();
        }
        cronCache[announceName].stop();
        delete cronCache[announceName];
    }

    /**
     * run an announcement 
     */
    static async announce(announceName, channelId) {
        console.log(`announcing ${announceName} for ${channelId}`);
        const announcement: any = await DB.Announcement.findOne({
            where: {
                name: announceName,
                channelId: channelId
            }
        });

        if (!announcement){
            delete cronCache[announceName];
            return;
        }

        const richEmbed = {
            title: `:trumpet: New Announcement! :trumpet:`,
            fields: [{
                title: `Title`,
                value: announceName
            },
            {
                title: 'Announcement',
                value: announcement.description
            }]
        }
        const channel = await Cron.getChannel(channelId);
        if (channel === null) {
            await announcement.destroy();
            cronCache[announceName].stop();
            delete cronCache[announceName];
            return;
        }
        channel.send(helper.buildRichMsg(richEmbed));
    }

    static async getChannel(channelId) {
        return await bot.channels.find(x => x.id === channelId);
    }
}