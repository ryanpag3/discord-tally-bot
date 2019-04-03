import {
    Message
} from "discord.js";
import helper from '../util/cmd-helper';
import DB from '../util/db';

const Tally = DB.Tally;

export default async (message: Message) => {
    const msg = message.content.split(' ');
    msg.shift(); // prefix
    msg.shift(); // command

    const tallyName = msg.shift();

    try {
        // const exists = await channelTallyExists(tallyName, message.channel.id);
        // if (exists) throw new Error(`A channel-specific tally with the name **${tallyName}** already exists. Consider using a different channel.`);

        await Tally.update({
            isGlobal: false
        }, {
            where: {
                name: tallyName,
                channelId: message.channel.id,
                serverId: message.guild.id
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
        console.log(tally);
        const richEmbed = {
            description: `**${tally.name}** has been set to be channel specific. You can always revert this by running \`!tb global ${tally.name}\`` + 
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