import DB from './db';
import Redis from './redis';
import logger from './logger';
import CronEventSubscriber from './cron-event-subscriber';

const db = new DB();

export default class CronDeployer {
    static TALLYBOT_ANNOUNCEMENTS = 'tallybot.announcements'

    static async deployActiveAnnouncements() {
        const deployPayload = {};
        const db = new DB(); 
        const announcements: any = await db.Announcement.findAll({
            where: {
                active: true
            }
        });
        for (let announce of announcements) {
            if (announce.datePattern == null) continue;
            deployPayload[announce.id] = CronDeployer.buildAnnouncePayload(announce);
        }
        await CronDeployer.setAnnouncements(deployPayload);
        await CronEventSubscriber.startListening();
    }

    static buildAnnouncePayload(announce) {
        let date;
        if (isValidDate(announce.datePattern)) date = new Date(announce.datePattern);
        return {
            id: announce.id,
            name: announce.name,
            description: announce.description,
            channelId: announce.channelId,
            date: date || announce.datePattern,
            isAlert: announce.isAlert
        }

        function isValidDate(d) {
            const ts = Date.parse(d);
            return isNaN(ts) == false;
        }
    }

    static async deployAnnouncement(announcement: any) {
        const unparsed = await Redis.get(CronDeployer.TALLYBOT_ANNOUNCEMENTS);
        let payload = JSON.parse(unparsed);
        payload[announcement.id] = CronDeployer.buildAnnouncePayload(announcement);
        await CronDeployer.setAnnouncements(payload);
    }

    static async removeAnnouncement(announcementId: string) {
        const unparsed = await Redis.get(CronDeployer.TALLYBOT_ANNOUNCEMENTS);
        let payload = JSON.parse(unparsed);
        delete payload[announcementId];
        await CronDeployer.setAnnouncements(payload);
    }

    static async setAnnouncements(payload: any) {
        await Redis.set(CronDeployer.TALLYBOT_ANNOUNCEMENTS, JSON.stringify(payload));
    }
}