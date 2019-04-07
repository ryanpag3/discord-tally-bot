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
    let amount = cArr.shift();

    if (!tallyId || !amount) {
        message.channel.send('ID and/or amount required. Please try again using the correct syntax. :wink:');
        return;
    }

    console.log('Setting [' + tallyId + '] to ' + amount);

    const where = {
        name: tallyId,
        channelId: message.channel.id,
        serverId: message.guild.id,
        isGlobal: isGlobal
    };

    if (isGlobal) delete where.channelId;

    Tally.findOne({ where: {name: tallyId, channelId: message.channel.id}})
        .then((record: any) => {
            if (!record) throw `${'**'+tallyId+'**' || 'an empty string'} doesn't exist.`;

            return Tally.update({
                count: amount
            }, {
                returning: true,
                where: where
            })
            .then(() => {
                record.count += 1;
                return record;
            });
        })
        .then((record) => {
            const msg = {
                description : `
                [${isGlobal ? 'G' : 'C'}] **${record.name}** is now ${amount}
set by **${message.author.toString()}**
                `
            }

            helper.finalize(message);

            message.channel.send(helper.buildRichMsg(msg));
        })
        .catch((err) => {
            const msg = {
                description: `
I couldn't set [${isGlobal ? 'G' : 'C'}] **${name}** because ${err}
set attempted by **${message.author.toString()}**
                `
            }

            helper.finalize(message);

            message.channel.send(helper.buildRichMsg(msg));
        });
}