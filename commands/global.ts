import {
    Message
} from "discord.js";
import helper from '../util/cmd-helper';
import DB from '../util/db';

const db = new DB();
const Tally = db.Tally;

export default async (message: Message) => {
    const msg = message.content.split(' ');
    msg.shift(); // prefix
    msg.shift(); // command
    const tallyName = msg.shift();

    try {
        await db.updateTally(
            message.channel.id,
            message.guild.id,
            false,
            tallyName,
            {
                isGlobal: true
            }
        );

        const isGlobal = true;
        const tally = await db.getTally(
            message.channel.id,
            message.guild.id,
            true,
            tallyName
        );       
        if (!tally) throw `Tally could not be found with name **${tallyName}**`;
        const richEmbed = {
            description: `[${isGlobal ? 'G' : 'C'}] **${tally.name}** has been set to global scope.\n\nYou can revert this with \`!tb channel ${tallyName}\`\n\nblame ${message.author.toString()}`
        }
        message.channel.send(helper.buildRichMsg(richEmbed));
    } catch (e) {
        if (e.toString().toLowerCase().includes('validation error')) {
            e = new Error(`There is already a tally with name ${tallyName} set to be globally scoped.`);
        }
        const error = `There was an error while attempting to set tally to be global. \n\n${e}`;
        const rich = {
            description: error + `\n\nBlame ${message.author.toString()}`
        };
        message.channel.send(helper.buildRichMsg(rich));
    }
}