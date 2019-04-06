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
    if (isGlobal) msg.shift();
    const tallyName = msg.shift();

    try {
        await Tally.update({
            isGlobal: false
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
                isGlobal: false,
                name: tallyName,
                serverId: message.guild.id,
                channelId: message.channel.id
            }
        });
        const richEmbed = {
            description: `[${isGlobal ? 'G' : 'C'}] **${tally.name}** has been set to be channel specific. \n\nYou can always revert this by running \`!tb global ${tally.name}\`` + 
            `\n\nBlame **${message.author.toString()}**`
        };
        message.channel.send(helper.buildRichMsg(richEmbed));

    } catch (e) {
        const error = `There was an error while attempting to set tally to be channel specific. ${e}`;
        const rich = {
            description: error + `\n\nBlame ${message.author.toString()}`
        };
        message.channel.send(helper.buildRichMsg(rich));
    }
}

async function channelTallyExists(tallyName, channelId) {
    const tally = await Tally.findOne({
        where: {
            name: tallyName,
            channelId: channelId
        }
    });
    return tally != null; 
}