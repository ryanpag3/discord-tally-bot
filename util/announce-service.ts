import { Op } from 'sequelize';
import chrono from 'chrono-node'
import config from '../config.json';
import DB from './db';
import announce from '../commands/announce.js';
import helper from './cmd-helper';

const env = process.env.NODE_ENV || 'development';
const devEnv = env === 'development';

export default class AnnounceService {
    private bot: any;

    constructor(params) {
        this.bot = params.bot;
    }

    async start() {
        setInterval(async () => await this.run(), devEnv ? config.announce_check_interval_dev : config.announce_check_interval)
    }

    /**
     * TODO: error handling
     */
    async run() {
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

            // console.log(`Checking for announcements for ${announcements.length} valid entries.`);

            for (let announcement of announcements) {
                this.checkForAnnounce(announcement);
            }
        } catch (e) {
            console.log(e);
        }
    }

    async checkForAnnounce(announcement) {
        if (announcement.dateQuery) {
            this.checkDateQuery(announcement);
        } else if (announcement.tallyName && announcement.tallyGoal) {
            this.checkTallyGoal(announcement);
        }
    }

    private async checkDateQuery(announcement) {
        const parsed = chrono.parse(announcement.dateQuery);
        // console.log(JSON.stringify(parsed));
    }

    private async checkTallyGoal(announcement) {
        const tally = await DB.Tally.findOne({ where: {
            channelId: announcement.channelId,
            name: announcement.tallyName,
            count: announcement.tallyGoal
        }});
        if (!tally || announcement.announcementRan === true) return;
        announcement.announcementRan = true;
        announcement.save();
        console.log(`announcement triggered: ${JSON.stringify(announcement)}`);
        const Channel = await this.bot.channels.find(x => x.id === announcement.channelId);
        const richEmbed = {
            title: `:trumpet: Announcement **${announcement.name}** :trumpet:`,
            description: `${announcement.description}\n\n**Goal reached:** ${announcement.tallyName} has hit ${announcement.tallyGoal}!`
        }
        Channel.send(helper.buildRichMsg(richEmbed));
    }
}