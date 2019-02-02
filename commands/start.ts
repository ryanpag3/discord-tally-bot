// start a timer
import {
    Message
} from "discord.js";
import moment from 'moment';
import db from '../util/db';
import helper from '../util/cmd-helper';

// create a timer
export default async (message: Message) => {
    let msg = message.content.split(' ');
    msg.shift(); // prefix
    msg.shift(); // command
    const timerName = msg.shift();
    const Timer = db.Timer;

    try {
        let timer: any = await Timer.findOne({
            where: {
                name: timerName,
                channelId: message.channel.id
            }
        });

        if (timer == null)
            throw `Could not find timer **${timerName}** to start.`

        if (timer.startDate == null) { // already started
            const now = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
            timer.startDate = now;
        }

        timer.stopDate = null;
        await timer.save();

        const msg = {
            description: `
:clock: Timer **${timerName}** started. ${(timer.totTime ? '\n\nTotal time: **' + timer.totTime + '**' : '')}

Stop with \`!tb stop <name>\`

Blame **${message.author.toString()}**
            `
        }
        helper.finalize(message);
        message.channel.send(helper.buildRichMsg(msg));
    } catch (e) {
        const msg = {
            description: `
${e}
            
Blame **${message.author.toString()}**
            `
        }
        helper.finalize(message);
        message.channel.send(helper.buildRichMsg(msg));
    }
}