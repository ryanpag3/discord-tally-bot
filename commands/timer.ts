import {
    Message
} from "discord.js";
import db from '../util/db';
import helper from '../util/cmd-helper';

// create a timer
export default async (message: Message) => {
    let isDelete = false;
    let msg = message.content.split(' ');
    msg.shift(); // prefix
    msg.shift(); // command
    let timerName = msg.shift();
    // sub-command, this may be an anti-pattern. TODO
    if (timerName == 'rm') {
        timerName = msg.shift();
        isDelete = true;
    }

    let timerDescription = msg.join(' ');
    const Timer = db.Timer;

    try {
        if (isDelete == true) {
            await Timer.destroy({
                where: {
                    name: timerName,
                    channelId: message.channel.id
                }
            });
        } else {
            await Timer.create({
                name: timerName,
                description: timerDescription,
                channelId: message.channel.id,
                startDate: null,
                endDate: null,
                totTime: null
            });
        }
        const msg = {
            description: `
            :clock: Timer **${timerName}** ${isDelete == true ? 'destroyed' : 'created'}.
            ${timerDescription}

            ${isDelete == true ? 'You can recreate with \`!tb timer ' + timerName + '\`' : 'Start with \`!tb start <name>\`'}

            Blame **${message.author.tag}**
            `
        }
        helper.finalize(message);
        message.channel.send(helper.buildRichMsg(msg));
    } catch (e) {
        if (e.toString().indexOf('Validation error') != -1) {
            const msg = {
                description: `
                Could not ${isDelete == true ? 'delete' : 'create'} timer **${timerName}**. ${isDelete == true ? 'It doesn\'t exist!' : 'It already exists!'} :thinking:
                
                Blame **${message.author.tag}**
                `
            }
            helper.finalize(message);
            message.channel.send(helper.buildRichMsg(msg));
            return;
        }
        const msg = {
            description: `
            There was an error while creating the timer: ${e}
            
            Blame **${message.author.tag}**
            `
        };
        helper.finalize(message);
        message.channel.send(helper.buildRichMsg(msg));
    }
}