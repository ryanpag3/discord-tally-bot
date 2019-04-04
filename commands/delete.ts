import {
    Message
} from "discord.js";
import DB from '../util/db';
import helper from '../util/cmd-helper';

const Tally = DB.Tally;

export default (message: Message) => {
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
    Tally.destroy({
        where: {
            name: tallyId,
            channelId: message.channel.id,
            serverId: message.guild.id,
            isGlobal: isGlobal
        }
    })
        .then((res) => {
            const successMsg = {
                description: `[${isGlobal ? 'G' : 'C'}] **${tallyId}** has been deleted.\ndeleted by **${message.author.toString()}**`
            };

            const failMsg = {
                description: `[${isGlobal ? 'G' : 'C'}] **${tallyId}** doesn't exist in my database.\ndelete attempted by **${message.author.toString()}**`
            }

            helper.finalize(message);

            if (res == 1)
                message.channel.send(helper.buildRichMsg(successMsg));
            else
                message.channel.send(helper.buildRichMsg(failMsg));
        });
}