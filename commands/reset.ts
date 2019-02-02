// start a timer
import { Message } from "discord.js";
import moment from 'moment';
import db from '../util/db';
import helper from '../util/cmd-helper';

// reset a timer
export default async (message: Message) => {
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
        timer.stopDate = null;
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
            description: `
${e}
            
<<<<<<< HEAD
            Blame **${message.author.toString()}**
=======
Blame **${message.author.toString()}**
>>>>>>> 93e341fae1dd142f9630e8272740e063f13336c7
            `
        }
        helper.finalize(message);
        message.channel.send(helper.buildRichMsg(msg));    
    }
}