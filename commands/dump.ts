import {
    Message
} from "discord.js";
import { increaseTotalDumpCount } from '../util/counter';
import DB from '../util/db';
import helper from '../util/cmd-helper';

const Tally = DB.Tally;

export default (message: Message) => {
    const isGlobal = helper.isGlobalTallyMessage(message);
    const msg = message.content.split(' ');
    msg.shift(); // prefix
    msg.shift(); //command
    if (isGlobal) msg.shift(); // -g
    const tallyName = msg.shift();

    const dumpAmt = Number.parseInt(msg.shift());

    console.log(`Dumping [${isGlobal ? 'G' : 'C'}] [${tallyName}] by ${dumpAmt || 1}`);
    
    Tally.findOne({ where: {name: tallyName, channelId: message.channel.id}})
        .then((record: any) => {
            if (!record) {
                throw 'I couldn\'t find it in my system. Hmm... :thinking:';
            }
            return record;
        })
        .then((record: any) => {
            const amt = dumpAmt ? dumpAmt : 1;
            return Tally.update({
                    count: record.count - amt
                }, {
                    returning: true,
                    where: {
                        name: record.name,
                        channelId: message.channel.id,
                        serverId: message.guild.id,
                        isGlobal: isGlobal
                    }
                })
                .then(() => {
                    record.previous = record.count;
                    record.count -= amt;
                    return record;
                });
        })
        .then((record) => {
            // TODO: make unique to dump
            const userEmojis = [
                ':spy:', ':upside_down:', ':poop:', ':ghost:', ':astonished:', ':pray:', ':fist:',
                ':tongue:', ':santa:', ':crown:', ':right_fist:'
            ]
            const description = record.description && record.description != '' ? record.description : undefined;
            const msg = {
                description: `[${isGlobal ? 'G' : 'C'}] **${record.name}** | **${record.previous}** >>> **${record.count}** ${(description ? '\n• _' + description + '_' : '')}
                \n${helper.getRandomPhrase(userEmojis)} **${message.author.toString()}**
                `
            }

            increaseTotalDumpCount();

            helper.finalize(message);

            message.channel.send(helper.buildRichMsg(msg));
        })
        .catch((err) => {
            const failMsg = {
                description: `I couldn't dump **${name}** because ${err}
                dump attempted by ${message.author.toString()}**`
            }

            helper.finalize(message);

            message.channel.send(helper.buildRichMsg(failMsg));
        });
}