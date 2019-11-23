import {
    Message
} from "discord.js";
import DB from '../util/db';
import helper from '../util/cmd-helper';

const db = new DB();
const Tally = db.Tally;

export default async (message: Message) => {
    const isGlobal = helper.isGlobalTallyMessage(message);
    let content = helper.removePrefixCommand(message.content, 2);
    let cArr = content.split(' ');
    if (isGlobal) cArr.shift(); // -g
    let tallyId = cArr.shift();

    if (!tallyId) {
        message.channel.send('Name is required to delete!')
        return;
    }

    console.log('Deleting tally [' + tallyId + ']');

    try {
        await db.deleteTally(
            message.channel.id,
            message.guild.id,
            isGlobal,
            tallyId
        );

        const successMsg = {
            description: `[${isGlobal ? 'G' : 'C'}] **${tallyId}** has been deleted.\ndeleted by **${message.author.toString()}**`
        };

        helper.finalize(message);

        message.channel.send(helper.buildRichMsg(successMsg));
    } catch (e) {
        const failMsg = {
            description: `[${isGlobal ? 'G' : 'C'}] **${tallyId}** doesn't exist in my database.\ndelete attempted by **${message.author.toString()}**`
        }
        message.channel.send(helper.buildRichMsg(failMsg));
    }
}