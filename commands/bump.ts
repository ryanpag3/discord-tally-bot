import { Message } from 'discord.js';
import DB from '../util/db';
import helper from '../util/cmd-helper';
import Counter from '../util/counter';

const USER_EMOJIS = [
    ':spy:', ':upside_down:', ':poop:', ':ghost:', ':astonished:', ':pray:', ':fist:',
    ':tongue:', ':santa:', ':crown:', ':right_fist:'
]

export default async (message: Message) => {
    const db = new DB();
    const isGlobal = helper.isGlobalTallyMessage(message);
    const msg = message.content.split(' ');
    msg.shift(); // rm prefix
    msg.shift(); // rm command
    if (isGlobal) msg.shift() // -g
    let name = msg.shift();
    let bumpAmount: number = Number.parseInt(msg.shift());

    console.log(`Bumping [${name} | Global: ${isGlobal}] by ${bumpAmount || 1}`);

    try {
        const tally = await db.getTally(
            message.channel.id,
            message.guild.id,
            isGlobal,
            name
        );
    
        if (!tally) {
            throw 'I couldn\'t find it. Check your spelling? :thinking:';
        }

        const amount = bumpAmount ? bumpAmount : 1;
        const previous = tally.count;
        // tally.count += amount;
        // await tally.save();

        await db.updateTally(
            message.channel.id,
            message.guild.id,
            isGlobal,
            name,
            {
                count: tally.count += amount
            }
        );

        const description = tally.description && tally.description != '' ? tally.description : undefined;
        console.log(description);
        const msg = {
            description: `
            [${isGlobal ? 'G' : 'C'}] **${tally.name}** | **${previous}** >>> **${tally.count}** ${(description ? '\n• _' + description + '_' : '')}

            ${helper.getRandomPhrase(USER_EMOJIS)} **${message.author.toString()}**
            `
        }

        Counter.bumpTotalBumps();
        helper.finalize(message);
        message.channel.send(helper.buildRichMsg(msg));

    } catch (e) {
        console.log(e);
        const msg = {
            description: `I couldn't bump ${name} because ${e}
            bump attempted by **${message.author.toString()}**`
        }
        helper.finalize(message);
        message.channel.send(helper.buildRichMsg(msg));
    }

}