// change description for tally
import {
    Message
} from "discord.js";
import DB from '../util/db';
import helper from '../util/cmd-helper';
import help from "./help";

const Tally = DB.Tally;

export default async (message: Message) => {
    const isGlobal = helper.isGlobalTallyMessage(message);
    const msg = message.content.split(' ');
    msg.shift(); // prefix
    msg.shift(); // command
    if (isGlobal) msg.shift(); // -g
    let name = msg.shift();
    let description = msg.join(' ');

    console.log('Setting description of [' + name + ']');

    const where = {
        name: name,
        channelId: message.channel.id,
        serverIs: message.guild.id,
        isGlobal: isGlobal
    };
    if (isGlobal) delete where.channelId;

    await Tally.update({
        description: description
    }, {
        returning: true,
        where: where
    });


    const tally: any = await Tally.findOne({
        where: where
    });

    if (!tally) {
        const msg = {
            description: `
            Could not find [${isGlobal ? 'G' : 'C'}] **${name}** to update.\nupdate attempted by **${message.author.toString()}**
            `
        }
        helper.finalize(message);
        message.channel.send(helper.buildRichMsg(msg));
        return;
    }

    const phrases = [
        'Make up your mind already.',
        'Snip snap snip snap!',
        'Welcome to the dark side...',
        `Typo alert!`,
        `Insert sardonic response here.`
    ];

    const msgObj = {
        title: `_\"${helper.getRandomPhrase(phrases)}\"_`,
        fields: [{
                title: `Tally`,
                value: `[${isGlobal ? 'G' : 'C'}] ${tally.name}`
            },
            {
                title: `Updated Description`,
                value: tally.description
            },
            {
                title: `Updated by`,
                value: message.author.toString()
            }
        ]
    }

    helper.finalize(message);

    message.channel.send(helper.buildRichMsg(msgObj));
}