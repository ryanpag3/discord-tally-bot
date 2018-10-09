// change description for tally
import {
    Message
} from "discord.js";
import DB from '../util/db';
import helper from '../util/cmd-helper';

const Tally = DB.tally;

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

    const tally: any = await Tally.findOne({ where: {
        name: name,
        channelId: message.channel.id
    }});

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
            }
        ]
    }
    
    message.channel.send(helper.buildRichMsg(msgObj));
}