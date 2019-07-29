import { Message } from "discord.js";
import { increaseTotalDumpCount } from '../util/counter';
import DB from '../util/db';
import helper from '../util/cmd-helper';

const USER_EMOJIS = [
    ':spy:', ':upside_down:', ':poop:', ':ghost:', ':astonished:', ':pray:', ':fist:',
    ':tongue:', ':santa:', ':crown:', ':right_fist:'
]

export default async (message: Message) => {
    const isGlobal = helper.isGlobalTallyMessage(message);
    const msg = message.content.split(' ');
    msg.shift(); // prefix
    msg.shift(); //command
    if (isGlobal) msg.shift(); // -g
    const tallyName = msg.shift();

    const dumpAmt = Number.parseInt(msg.shift());

    console.log(`Dumping [${isGlobal ? 'G' : 'C'}] [${tallyName}] by ${dumpAmt || 1}`);

    try {
        const tally = await DB.getTally(
            message.channel.id,
            message.guild.id,
            isGlobal,
            tallyName
        );

        if (!tally) {
            throw 'I couldn\'t find it in my system. Hmm... :thinking:';
        }
        
        const previous = tally.count;
        const amount = dumpAmt ? dumpAmt : 1;
        await DB.updateTally(
            message.channel.id,
            message.guild.id,
            isGlobal,
            tallyName,
            {
                count: tally.count -= amount
            }
        )


        const description = tally.description && tally.description != '' ? tally.description : undefined;
        const msg = {
            description: `[${isGlobal ? 'G' : 'C'}] **${tally.name}** | **${previous}** >>> **${tally.count}** ${(description ? '\n• _' + description + '_' : '')}
            \n${helper.getRandomPhrase(USER_EMOJIS)} **${message.author.toString()}**
            `
        }

        increaseTotalDumpCount();
        helper.finalize(message);
        message.channel.send(helper.buildRichMsg(msg));
    } catch (e) {
        const failMsg = {
            description: `I couldn't dump **${tallyName}** because ${e}
            dump attempted by ${message.author.toString()}`
        }

        helper.finalize(message);

        message.channel.send(helper.buildRichMsg(failMsg));
    }

    // const where = {
    //     name: tallyName,
    //     channelId: message.channel.id,
    //     serverId: message.guild.id,
    //     isGlobal: isGlobal
    // };
    
    // if (isGlobal) delete where.channelId;

    // Tally.findOne({ where: where })
    //     .then((record: any) => {
    //         if (!record) {
    //             throw 'I couldn\'t find it in my system. Hmm... :thinking:';
    //         }
    //         return record;
    //     })
    //     .then((record: any) => {
    //         const amt = dumpAmt ? dumpAmt : 1;
    //         return Tally.update({
    //                 count: record.count - amt
    //             }, {
    //                 returning: true,
    //                 where: where
    //             })
    //             .then(() => {
    //                 record.previous = record.count;
    //                 record.count -= amt;
    //                 return record;
    //             });
    //     })
    //     .then((record) => {
    //         // TODO: make unique to dump
    //         const userEmojis = [
    //             ':spy:', ':upside_down:', ':poop:', ':ghost:', ':astonished:', ':pray:', ':fist:',
    //             ':tongue:', ':santa:', ':crown:', ':right_fist:'
    //         ]
    //         const description = record.description && record.description != '' ? record.description : undefined;
    //         const msg = {
    //             description: `[${isGlobal ? 'G' : 'C'}] **${record.name}** | **${record.previous}** >>> **${record.count}** ${(description ? '\n• _' + description + '_' : '')}
    //             \n${helper.getRandomPhrase(userEmojis)} **${message.author.toString()}**
    //             `
    //         }

    //         increaseTotalDumpCount();

    //         helper.finalize(message);

    //         message.channel.send(helper.buildRichMsg(msg));
    //     })
    //     .catch((err) => {
    //         const failMsg = {
    //             description: `I couldn't dump **${name}** because ${err}
    //             dump attempted by ${message.author.toString()}**`
    //         }

    //         helper.finalize(message);

    //         message.channel.send(helper.buildRichMsg(failMsg));
    //     });
}