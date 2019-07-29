import {
    Message
} from "discord.js";
import DB from '../util/db';
import helper from '../util/cmd-helper';

const Tally = DB.Tally;

export default async (message: Message) => {
    const isGlobal = helper.isGlobalTallyMessage(message);
    let content = helper.removePrefixCommand(message.content, 2);
    let cArr = content.split(' ');
    if (isGlobal) cArr.shift(); // -g
    let name = cArr.shift();
    let amount = cArr.shift();

    console.log('Setting [' + name + '] to ' + amount);

    try {
        if (!name || !amount) {
            throw 'ID and/or amount required. Please try again using the correct syntax. :wink:';
        }

        const tally = await DB.getTally(
            message.channel.id,
            message.guild.id,
            isGlobal,
            name
        );

        if (!tally) throw `${'**'+name+'**' || 'an empty string'} doesn't exist.`;

        await DB.updateTally(
            message.channel.id,
            message.guild.id,
            isGlobal,
            name,
            {
                count: amount
            }
        );

        const msg = {
            description : `
            [${isGlobal ? 'G' : 'C'}] **${tally.name}** is now ${amount}\n• ${tally.description}\nset by **${message.author.toString()}**
            `
        }

        helper.finalize(message);

        message.channel.send(helper.buildRichMsg(msg));

    } catch (e) {
        const msg = {
            description: `
I couldn't set [${isGlobal ? 'G' : 'C'}] **${name}** because ${e}
set attempted by **${message.author.toString()}**
            `
        }

        helper.finalize(message);

        message.channel.send(helper.buildRichMsg(msg));
    }

//     const where = {
//         name: tallyId,
//         channelId: message.channel.id,
//         serverId: message.guild.id,
//         isGlobal: isGlobal
//     };

//     if (isGlobal) delete where.channelId;

//     Tally.findOne({ where: {name: tallyId, channelId: message.channel.id}})
//         .then((record: any) => {
//             if (!record) throw `${'**'+tallyId+'**' || 'an empty string'} doesn't exist.`;

//             return Tally.update({
//                 count: amount
//             }, {
//                 returning: true,
//                 where: where
//             })
//             .then(() => {
//                 record.count += 1;
//                 return record;
//             });
//         })
//         .then((record) => {
//             const msg = {
//                 description : `
//                 [${isGlobal ? 'G' : 'C'}] **${record.name}** is now ${amount}
// set by **${message.author.toString()}**
//                 `
//             }

//             helper.finalize(message);

//             message.channel.send(helper.buildRichMsg(msg));
//         })
//         .catch((err) => {
//             const msg = {
//                 description: `
// I couldn't set [${isGlobal ? 'G' : 'C'}] **${name}** because ${err}
// set attempted by **${message.author.toString()}**
//                 `
//             }

//             helper.finalize(message);

//             message.channel.send(helper.buildRichMsg(msg));
//         });
}