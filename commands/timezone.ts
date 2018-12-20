import { Message } from "discord.js";
import helper from '../util/cmd-helper';
import DB from '../util/db';

export default async (message: Message) => {
    console.log('Running timezone command for channel [' + message.channel.id + ']');

    const msgSplit = message.content.split(' ');
    try {
        await DB.Channel.upsert({
            id: message.channel.id,
            timezone: msgSplit[2]
        })
        const richEmbed = {
            description: `Channel timezone has been set to **${msgSplit[2]}**\n\nset by ${message.author.toString()}`
        }
        helper.finalize(message);
        message.channel.send(helper.buildRichMsg(richEmbed));
    } catch (e) {
        const richEmbed = {
            description: `Could not set channel timezone. Reason: ${e.toString()}`
        }
    }
}