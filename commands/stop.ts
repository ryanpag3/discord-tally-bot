// stop a timer
import { Message } from "discord.js";
import moment from 'moment';
import db from '../util/db';
import helper from '../util/cmd-helper';
import TimerUtil from '../util/timer';

const tUtil = new TimerUtil();

// create a timer
export default async (message: Message) => {
    let msg = message.content.split(' ');
    msg.shift(); // prefix
    msg.shift(); // command
    const timerName = msg.shift();
    const Timer = db.Timer;

    try {
        let timer: any = await Timer.find({where: {
            name: timerName,
            channelId: message.channel.id
        }});

        if (timer == null)
            throw `Could not find timer **${timerName}** to stop.`
        
        if (timer.startDate == null)
            throw `**${timerName}** has not been started. Try that first!`;

        const start = moment(timer.startDate);
        const now = moment();
        timer.totTime = tUtil.getDurationStr(start, now, timer.totTime);
        timer.startDate = null;
        timer.stopDate = tUtil.getSQLDateTimeString(now);
        await timer.save();
        
        const totals = timer.totTime.split(':');
        const msg = {
            description: `
            :clock: Timer **${timerName}** stopped.

            Total time: **${totals[0]}h ${totals[1]}m ${totals[2]}s**

            Start again with \`!tb start <name>\`

            blame **${message.author.tag}**
            `
        }
        helper.finalize(message);
        message.channel.send(helper.buildRichMsg(msg));
    } catch (e) {
        const msg = {
            description: `
            ${e}
            
            Blame **${message.author.tag}**
            `
        }
        helper.finalize(message);
        message.channel.send(helper.buildRichMsg(msg));
    }
}

