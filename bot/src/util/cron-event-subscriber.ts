import Queue from 'bull';
import logger from './logger';
import DB from './db';
import CronDeployer from './cron-deployer';

const db = new DB();

export default class CronEventSubscriber {
    static ANNOUNCEMENT_DISABLE = 'announcement.disable';

    static eventQueue = new Queue('tallybot.cron.events', {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    });

    static startListening() {
        CronEventSubscriber.eventQueue.process(function(job) {
            return CronEventSubscriber.handleJob(job);
        });
    }

    static async handleJob(job: any) {
        const type = job.data.type;
        switch(type) {
            case CronEventSubscriber.ANNOUNCEMENT_DISABLE:
                return await CronEventSubscriber.disableAnnouncement(job.data.body);
            default:
                logger.error(`Unsupported event type provided. ${type}`, new Error());
        }
    }

    static async disableAnnouncement(jobData: any) {
        logger.info('disabling announcement');
        logger.info(jobData);
        const a = await db.deactivateAnnouncement(jobData.channelId, jobData.name);
        CronDeployer.removeAnnouncement(a.id);
    }
}