import {
    Message
} from 'discord.js';
import moment from 'moment';
import db from '../util/db';
import helper from '../util/cmd-helper';
import TimerUtil from '../util/timer';

const tUtil = new TimerUtil();
const Timer = db.Timer;

// show all timers
export default async (message: Message) => {
    try {
        const timers = await Timer.findAll({
            where: {
                channelId: message.channel.id
            }
        });

        if (!timers || timers.length == 0)
            throw 'Could not find timers for this channel!';

        const processedTimers = timers.map((timer: any) => {
            let processed = {
                name: timer.name,
                description: (timer.description == '' || !timer.description ? 'No description.' : timer.description),
                totalTime: timer.totTime || ''
            };
            if (timer.startDate != null) {
                const now = moment();
                const start = moment(timer.startDate);
                processed.totalTime = tUtil.getDurationStr(start, now, timer.totTime);
            }
            return processed;
        });

        let description = ':clock1: Here are your timers. :clock1:\n\n';
        processedTimers.map((timer) => {
            description += `**${timer.name}** ${timer.totalTime || '00:00:00'} | ${helper.truncate(timer.description, 50)}\n`;
        });
        description += `\nBlame **${message.author.tag}**`
        const msg = {
            description: description
        };
        helper.finalize(message);
        message.channel.send(helper.buildRichMsg(msg));
    } catch (e) {
        const msg = {
            description: `
${e}
            
Blame **${message.author.tag}**`
        };
        helper.finalize(message);
        message.channel.send(helper.buildRichMsg(msg));
    }
}