import Queue from 'bull';
import logger from './logger';
import DB from './db';
import CronDeployer from './cron-deployer';

const db = new DB();

export default class CronEventSubscriber {
    static ANNOUNCEMENT_DISABLE = 'announcement.disable';
    static ANNOUNCEMENT_ALERT = 'announcement.alert';

    static eventQueue = new Queue('tallybot.cron.events', {
        redis: {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
        }
    });

    static announcerEventQueue = new Queue('tallybot.announcer.events', {
        redis: {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
        }
    })

    static startListening() {
        CronEventSubscriber.eventQueue.process(function (job) {
            return CronEventSubscriber.handleJob(job);
        });
    }

    static async handleJob(job: any) {
        const type = job.data.type;
        switch (type) {
            case CronEventSubscriber.ANNOUNCEMENT_DISABLE:
                return await CronEventSubscriber.disableAnnouncement(job.data.body);
            case CronEventSubscriber.ANNOUNCEMENT_ALERT:
                return await CronEventSubscriber.createAlertMessage(job.data.body);
            default:
                logger.error(`Unsupported event type provided. ${type}`, new Error());
        }
    }

    static async disableAnnouncement(jobData: any) {
        logger.info(`disabling announcement for channelId ${jobData.channelId} and name ${jobData.name}`);
        const a = await db.deactivateAnnouncement(jobData.channelId, jobData.name);
        CronDeployer.removeAnnouncement(a.id);
    }

    static async createAlertMessage(jobData: any) {
        const announcement = await db.Announcement.findByPk(jobData.id);
        const tallies = announcement.tallyName.split(',');
        const promises = tallies.map(async(t) => db.getCmdTally(announcement.channelId, undefined, false, t));
        const resolved = await Promise.all(promises);
        CronEventSubscriber.announcerEventQueue.add(resolved);
    }
}
