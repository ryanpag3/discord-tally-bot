import { Message } from "discord.js";
import Counter from '../util/counter';
import DB from '../util/db';
import helper from '../util/cmd-helper';

const USER_EMOJIS = [
    ':spy:', ':upside_down:', ':poop:', ':ghost:', ':astonished:', ':pray:', ':fist:',
    ':tongue:', ':santa:', ':crown:', ':right_fist:'
]

export default async (message: Message) => {
    const db = new DB();
    const isGlobal = helper.isGlobalTallyMessage(message);
    const msg = message.content.split(' ');
    msg.shift(); // prefix
    msg.shift(); //command
    if (isGlobal) msg.shift(); // -g
    const tallyName = msg.shift();

    const dumpAmt = Number.parseInt(msg.shift());

    console.log(`Dumping [${isGlobal ? 'G' : 'C'}] [${tallyName}] by ${dumpAmt || 1}`);

    try {
        const tally = await db.getTally(
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
        await db.updateTally(
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

        Counter.bumpTotalDumps();
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
}