import { Message } from "discord.js";
import CmdHelper from '../util/cmd-helper';
import DB from '../util/db';

/**
 * This command is responsible for setting all tallies to 0
 */
export default async (message: Message) => {
    const db = new DB();
    const split = message.content.split(' ');
    const isGlobal = split[2] !== undefined && split[2] === '-g';
    const { serverId, channelId } = getIds(message);
    const tallies = await db.updateTallies(serverId, { count: 0}, isGlobal === false ? channelId : undefined);
    const msg = {
        title: `${isGlobal === true ? 'Global' : 'Channel'} Tallies Emptied!`,
        description: `
        The following tallies have been set to 0.
        ----------------- 
        ${getFormattedTallies(tallies)}
        `
    }
    CmdHelper.finalize(message);
    message.channel.send(CmdHelper.buildRichMsg(msg));
}

function getFormattedTallies(tallies) {
    if (tallies.length === 0) {
        return 'No tallies found to empty.'
    }
    return tallies.map(t => {
        return `- **${t.name}**\n`;
    });
}

function getIds(message: Message) {
    return { channelId: message.channel.id, serverId: message.guild.id };
}
