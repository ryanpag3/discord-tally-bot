// change description for tally
import { Message } from 'discord.js';
import DB from '../util/db';
import helper from '../util/cmd-helper';
import help from './help';

export default async (message: Message) => {
    const isGlobal = helper.isGlobalTallyMessage(message);
    const msg = message.content.split(' ');
    msg.shift(); // prefix
    msg.shift(); // command
    if (isGlobal) msg.shift(); // -g
    let name = msg.shift();
    let description = msg.join(' ');

    console.log('Setting description of [' + name + ']');

    try {
        const db = new DB();
        await db.setTallyDescription(message.channel.id, message.guild.id, isGlobal, name, description);

        const tally = await db.getTally(message.channel.id, message.guild.id, isGlobal, name);

        if (!tally) {
            const msg = {
                description: `
            Could not find [${isGlobal ? 'G' : 'C'}] **${name}** to update.\nupdate attempted by **${message.author.toString()}**
            `
            };
            console.log(msg);
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
            fields: [
                {
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
        };

        helper.finalize(message);

        console.log(msgObj);
        message.channel.send(helper.buildRichMsg(msgObj));
    } catch (e) {
        const msg = {
            description: `Failed to set description for ${name}. Reason: ${e}\nBlame ${message.author.toString()}`
        };
        helper.finalize(message);
        message.channel.send(helper.buildRichMsg(msg));
    }
};
