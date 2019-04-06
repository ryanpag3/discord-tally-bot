import {
    Message
} from "discord.js";
import helper from '../util/cmd-helper';
import DB from '../util/db';

const Tally = DB.Tally;

export default async (message: Message) => {
    const isGlobal = helper.isGlobalTallyMessage(message);
    const msg = message.content.split(' ');
    msg.shift(); // prefix
    msg.shift(); // command
    if (isGlobal) msg.shift(); // -g
    const tallyName = msg.shift();

    try {
        await Tally.update({
            isGlobal: true
        }, {
            where: {
                name: tallyName,
                channelId: message.channel.id,
                serverId: message.guild.id,
                isGlobal: isGlobal
            }
        });
        const tally: any = await Tally.findOne({
            where: {
                isGlobal: true,
                name: tallyName,
                serverId: message.guild.id,
                channelId: message.channel.id
            }
        });
        if (!tally) throw `Tally could not be found with name **${tallyName}**`;
        const richEmbed = {
            description: `[${isGlobal ? 'G' : 'C'}] **${tally.name}** has been set to global scope.\n\nYou can revert this with \`!tb channel -g ${tallyName}\`\n\nblame ${message.author.toString()}`
        }
        message.channel.send(helper.buildRichMsg(richEmbed));
    } catch (e) {
        const error = `There was an error while attempting to set tally to be global. ${e}`;
        const rich = {
            description: error + `\n\nBlame ${message.author.toString()}`
        };
        message.channel.send(helper.buildRichMsg(rich));
    }
}