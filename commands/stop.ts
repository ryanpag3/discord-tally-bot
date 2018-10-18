// stop a timer
import { Message } from "discord.js";
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
        let timer: any = await Timer.find({where: {
            name: timerName,
            channelId: message.channel.id
        }});

        const format = "YYYY-MM-DD HH:mm:ss";
        const now = moment(new Date);
        const nowStr = now.format(format);
        const start = moment(timer.startTime).format("YYYY-MM-DD HH:mm:ss");
        
        timer.stopTime = nowStr;
        await timer.save();
        const duration = moment(timer.stopTime - timer.startTime);

        const msg = {
            description: `
            :clock: Timer **${timerName}** stopped.

            Length was ${now.diff(start, 'minutes')}

            Stop with \`!tb stop <name>\`

            blame **${message.author.tag}**
            `
        }
        helper.finalize(message);
        message.channel.send(helper.buildRichMsg(msg));
    } catch (e) {
        console.log(e);
    }
}