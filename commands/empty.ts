import { Message } from "discord.js";
import DB from '../util/db';
import helper from '../util/cmd-helper';

export default async (message: Message) => {
    const db = new DB();
    const isGlobal = helper.isGlobalTallyMessage(message);
    let content = helper.removePrefixCommand(message.content, 2);
    let cArr = content.split(' ');
    if (isGlobal) cArr.shift(); // -g
    let tallyId = cArr.shift();

    console.log(`Emptying tally [${isGlobal ? 'G' : 'C'}] [${tallyId}]`);

    try {
        const tally = await db.getTally(
            message.channel.id,
            message.guild.id,
            isGlobal,
            tallyId
        );

        if (!tally) {
            throw `I could ould not find Tally with name: [${isGlobal ? 'G' : 'C'}]` + tallyId;
        }

        await db.updateTally(
            message.channel.id,
            message.guild.id,
            isGlobal,
            tallyId,
            {
                count: 0
            }
        );

        const msg = {
            description: `
            [${isGlobal ? 'G' : 'C'}] **${tallyId}** has been set to 0 by **${message.author.toString()}**.
            `
        }

        helper.finalize(message);

        message.channel.send(helper.buildRichMsg(msg));
    } catch (e) {
        const msg = {
            description: `I couldn't empty [${isGlobal ? 'G' : 'C'}] **${tallyId}** because ${e}.
            \nempty attempted by **${message.author.toString()}**
            `
        }

        helper.finalize(message);

        message.channel.send(helper.buildRichMsg(msg));
    }
}