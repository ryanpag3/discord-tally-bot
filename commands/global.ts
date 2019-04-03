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
        // const existsAlready = await globalTallyExists(tallyName, message.guild.id);
        // if (existsAlready) throw new Error(`Tally with name **${tallyName}** has already been declared global. ` +
        // `Consider setting that tally to be channel specific before promoting this tally to global.\n\n` + 
        // `\`!tb channel ${tallyName}\``);
        await Tally.update({
            isGlobal: true
        }, {
            where: {
                name: tallyName,
                channelId: message.channel.id,
                serverId: message.guild.id
            }
        });
        const tally = await Tally.findOne({
            where: {
                isGlobal: true,
                name: tallyName,
                serverId: message.guild.id,
                channelId: message.channel.id
            }
        });
        console.log(tally);
    } catch (e) {
        const error = `There was an error while attempting to set tally to be global. ${e}`;
        const rich = {
            description: error + `\n\nBlame ${message.author.toString()}`
        };
        message.channel.send(helper.buildRichMsg(rich));
    }
}

async function globalTallyExists(tallyName, serverId) {
    const tally = await Tally.findOne({
        where: {
            name: tallyName,
            serverId: serverId
        }
    });
    return tally != null;
}