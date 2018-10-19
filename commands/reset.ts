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
        let timer: any = await Timer.find({where: {
            name: timerName,
            channelId: message.channel.id
        }});

        const now = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
        timer.startTime = null;
        timer.stopTime = null;
        await timer.save();
        
        const msg = {
            description: `
            :clock: Timer **${timerName}** has been reset.

            Start with \`!tb start <name>\`

            blame **${message.author.tag}**
            `
        }
        helper.finalize(message);
        message.channel.send(helper.buildRichMsg(msg));
    } catch (e) {
        console.log(e);
    }
}