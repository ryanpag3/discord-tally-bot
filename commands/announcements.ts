import {
    Message
} from "discord.js";
import DB from '../util/db';
import helper from '../util/cmd-helper';
import cmdHelper from "../util/cmd-helper";
import logger from "../util/logger";

const db = new DB();
const Announcement = db.Announcement;

export default async (message: Message) => {
    let msg = message.content.split(' ');
    msg.shift(); // prefix
    msg.shift(); // command
    const page: number = Number.parseInt(msg.shift()) || 1;

    logger.info('Showing announcements for channel [' + message.channel.id + ']');

    let records = await Announcement.findAll({
        where: {
            channelId: message.channel.id
        }
    });
    records = records.sort((a, b) => {
        if (a.count > b.count) return -1;
        if (a.count < b.count) return 1;
        return 0;
    });
    const total = records.length;
    const pageSize = 20;
    const totalPages = Math.floor(records.length / pageSize) == 0 ? 1 : Math.floor(records.length / pageSize) + 1; 
    records = cmdHelper.handlePagination(pageSize, page, records);
    
    let announcements = '';
    records.map((record) => {
        const description = record.description && record.description != '' ? record.description : undefined;

        announcements += `**${record.name}** • ${description ? '_' + truncate(description, 50) + '_' : 'no description.'}
        `;
    });
    announcements += `\nshown for **${message.author.toString()}**`;


    const richEmbed = {
        title: records.length == 0 ? 'No announcements could be found!' : `Here are the existing announcements. \nPage ${page} of ${totalPages} :arrow_right: ${total} total announcements.\nTry \`!tb announcements [number]\` to show next page\n`,
        description: announcements,
        color: '#42f4e2'
    }

    helper.finalize(message);

    message.channel.send(helper.buildRichMsg(richEmbed));
}

function truncate(string, len){
    if (string.length > len)
       return string.substring(0,len)+'...';
    else
       return string;
 };