// query for tally, print details
import { Message } from "discord.js";
import DB from '../util/db';
import helper from '../util/cmd-helper';

export default async (message: Message) => {
    const isGlobal = helper.isGlobalTallyMessage(message);
    let msg = message.content.split(' ');
    msg.shift(); // rm prefix
    msg.shift(); // rm 'details'
    if (isGlobal) msg.shift(); // -g
    const name = msg.shift();

    console.log(`Giving ${name} details for channel ${message.channel.id}`);

    try {
        const tally = await DB.getTally(
            message.channel.id,
            message.guild.id,
            isGlobal,
            name
        );

        if (!tally) throw new Error(`Could not find tally ${name}.`);

        const msg = {
            title: `[${isGlobal ? 'G' : 'C'}] **${tally.name}**`,
            description: ``,
            color: '#42f4e2',
            fields: [
                {
                    title: `Description`,
                    value: tally.description == '' ? 'No description.' : tally.description
                },
                {
                    title: `Count`,
                    value: `${tally.count}`
                }, 
                {
                    title: `Requested by`,
                    value: message.author.toString()
                }
            ]
        }

        helper.finalize(message);

        message.channel.send(helper.buildRichMsg(msg));
    } catch (e) {
        const msg = {
            description: `Could not find [${isGlobal ? 'G' : 'C'}] ${name}'s details.\n${e}\nAttempted by **${message.author.toString()}**.`
        };

        helper.finalize(message);
        message.channel.send(helper.buildRichMsg(msg));
    }
}