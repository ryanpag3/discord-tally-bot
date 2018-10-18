import { Message } from "discord.js";
import db from '../util/db';
import helper from '../util/cmd-helper';

// create a timer
export default async (message: Message) => {
    let msg = message.content.split(' ');
    msg.shift(); // prefix
    msg.shift(); // command
    const timerName = msg.shift();
    const timerDescription = msg.join(' ');
    const Timer = db.Timer;

    try {
        await Timer.create({
            name: timerName,
            description: timerDescription,
            channelId: message.channel.id,
            startTime: null,
            endTime: null
        });
        const msg = {
            description: `
            :clock: Timer **${timerName}** created.

            Start with \`!tb start <name>\`

            blame **${message.author.tag}**
            `
        }
        helper.finalize(message);
        message.channel.send(helper.buildRichMsg(msg));
    } catch (e) {
        
    }
}