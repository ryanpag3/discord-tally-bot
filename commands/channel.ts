import {
    Message
} from "discord.js";
import helper from '../util/cmd-helper';
import DB from '../util/db';

export default async (message: Message) => {
    const db = new DB();
    const msg = message.content.split(' ');
    msg.shift(); // prefix
    msg.shift(); // command
    const tallyName = msg.shift();

    try {
        await db.updateTally(
            message.channel.id,
            message.guild.id,
            true,
            tallyName,
            {
                isGlobal: false,
                channelId: message.channel.id
            }
        )
        const isGlobal = false;
        const tally = await db.getTally(
            message.channel.id,
            message.guild.id,
            isGlobal,
            tallyName
        );
        const richEmbed = {
            description: `[${isGlobal ? 'G' : 'C'}] **${tally.name}** has been set to be channel specific. \n\nYou can always revert this by running \`!tb global ${tally.name}\`` + 
            `\n\nBlame **${message.author.toString()}**`
        };
        message.channel.send(helper.buildRichMsg(richEmbed));

    } catch (e) {
        if (e.toString().toLowerCase().includes('validation error')) {
            e = new Error(`There is already a tally with name ${tallyName} set to be channel scoped.`);
        }
        
        const error = `There was an error while attempting to set tally to be channel specific. \n\n ${e}`;
        const rich = {
            description: error + `\n\nBlame ${message.author.toString()}`
        };
        message.channel.send(helper.buildRichMsg(rich));
    }
}