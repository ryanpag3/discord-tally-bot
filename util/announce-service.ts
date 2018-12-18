import { Op } from 'sequelize';
import config from '../config.json';
import DB from './db';
import announce from '../commands/announce.js';

const env = process.env.NODE_ENV || 'development';
const devEnv = env === 'development';

export default class AnnounceService {
    static async start() {
        setInterval(async () => await AnnounceService.run(), devEnv ? config.announce_check_interval_dev : config.announce_check_interval)
    }

    /**
     * TODO: error handling
     */
    static async run() {
        console.log('running');
        // query all announcements
        // check if tally is valid?
        try {
            const announcements: Array<any> = await DB.Announcement.findAll({
                where: {
                    [Op.or]: [
                        {
                            dateQuery: {
                                [Op.ne]: null
                            }
                        },
                        {
                            [Op.and]: {
                                tallyName: {
                                    [Op.ne]: null
                                },
                                tallyGoal: {
                                    [Op.ne]: null
                                }
                            }
                        }
                    ]
                }
            });

            for (let announcement of announcements) {
                console.log(announcement.name);
                AnnounceService.checkForAnnounce(announcement);
            }
        } catch (e) {
            console.log(e);
        }
    }

    static async checkForAnnounce(announcement) {
        if (announcement.dateQuery) {
            AnnounceService.checkDateQuery(announcement);
        } else if (announcement.tallyName && announcement.tallyGoal) {
            AnnounceService.checkTallyGoal(announcement);
        }
    }

    static async checkDateQuery(announcement) {

    }

    static async checkTallyGoal(announcement) {
        const tally = DB.Tally.findOne({ where: {
            channelId: announcement.channelId,
            name: announcement.tallyName,
            count: announcement.tallyGoal
        }});
        const Channel = await 
        console.log('****TALLY GOAL****');
    }

    static async sendTallyGoal(announcement) {

    }
}