import { Message } from "discord.js";
import DB from "./db";
import MsgHelper from "../message/msg-helper";
import logger from "./logger";
import Env from "./env";

const db = new DB();

export default class AnnounceUtil {
    static async announceTallyGoalIfExists(message: Message, tallyName: string) {
        const announcements = await db.getAnnouncements({ channelId: message.channel.id, tallyName, tallyGoalReached: false, isAlert: false });
        logger.debug(`found ${announcements.length} announcements for tally`);
        await AnnounceUtil.announceTallyGoals(message, announcements);
    }

    static async announceTallyGoals(message: Message, announcements: any[]) {
        for (const announcement of announcements) {
            await AnnounceUtil.announceTallyGoal(message, announcement);
        }
    }

    static async announceTallyGoal(message: Message, announcement: any) {   
        const tallyCountReached = await AnnounceUtil.isTallyCountReached(message, announcement);
        if (!tallyCountReached) {
            logger.debug(`tally count goal has not been reached... skipping`);
            return;
        }
        const richEmbed = MsgHelper.getRichEmbed(message.author.username)
            .setTitle(`:trumpet: Announcement Tally Goal Reached! :trumpet:`)
            .addField(`Announcement Name`, announcement.name)
            .addField(`Tally Name`, announcement.tallyName)
            .addField(`Tally Goal`, announcement.tallyGoal);
        await message.channel.send(richEmbed);
        await AnnounceUtil.markGoalAnnounced(announcement);
        logger.info(`Announced tally goal for ${message.channel.id}`);
    }
    
    static async isTallyCountReached(message: Message, announcement: any) {
        const tally = await db.getCmdTally(message.channel.id, message.guild.id, false, announcement.tallyName);
        // if (!tally) return true; // TODO: flag as invalid?
        if (tally.count < announcement.tallyGoal)
            return false;
        return true;
    }

    static async markGoalAnnounced(announcement: any) {
        announcement.tallyGoalReached = true;
        await announcement.save();
    }
}