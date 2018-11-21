// change description for tally
import {
    Message
} from "discord.js";
import DB from '../util/db';
import helper from '../util/cmd-helper';
import help from "./help";

const Tally = DB.Tally;

export default async (message: Message) => {
    const msg = message.content.split(' ');
    msg.shift(); // prefix
    msg.shift(); // command

    let name = msg.shift();
    let description = msg.join(' ');

    console.log('Setting description of [' + name + ']');

        await Tally.update({
            description: description
        }, {
            returning: true,
            where: {
                name: name,
                channelId: message.channel.id
            }
        });


    const tally: any = await Tally.findOne({
        where: {
            name: name,
            channelId: message.channel.id
        }
    });

    if (!tally) {
        const msg = {
            description: `
            Could not find **${name}** to update.
            update attempted by **${message.author.toString()}**
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
                value: `${tally.name}`
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