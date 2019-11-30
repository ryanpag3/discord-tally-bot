// start a timer
import { Message } from "discord.js";
import moment from 'moment';
import DB from '../util/db';
import helper from '../util/cmd-helper';

// reset a timer
export default async (message: Message) => {
    const db = new DB();
    let msg = message.content.split(' ');
    msg.shift(); // prefix
    msg.shift(); // command
    const timerName = msg.shift();
    const Timer = db.Timer;

    try {
        let timer: any = await Timer.findOne({where: {
            name: timerName,
            channelId: message.channel.id
        }});

        if (!timer)
            throw `Could not find **${timerName}** to reset.`;

        timer.startDate = null;
        timer.endDate = null;
        timer.totTime = null;
        await timer.save();
        
        const msg = {
            description: `
:clock: Timer **${timerName}** has been reset to 00h 00m 00s.

Start with \`!tb start <name>\`

blame **${message.author.toString()}**
            `
        }
        helper.finalize(message);
        message.channel.send(helper.buildRichMsg(msg));
    } catch (e) {
        const msg = {
            description: `${e}\n\nBlame **${message.author.toString()}**
            `
        }
        helper.finalize(message);
        message.channel.send(helper.buildRichMsg(msg));    
    }
}