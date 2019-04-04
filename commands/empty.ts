import {
    Message
} from "discord.js";
import DB from '../util/db';
import helper from '../util/cmd-helper';

const Tally = DB.Tally;
const phrases = [
    ``
];

export default (message: Message) => {
    const isGlobal = helper.isGlobalTallyMessage(message);
    let content = helper.removePrefixCommand(message.content, 2);
    let cArr = content.split(' ');
    if (isGlobal) cArr.shift(); // -g
    let tallyId = cArr.shift();

    console.log(`Deleting tally [${isGlobal ? 'G' : 'C'}] [' + ${tallyId} + ']`);

    Tally.findOne({
            where: {
                name: tallyId,
                channelId: message.channel.id,
                serverId: message.guild.id,
                isGlobal: isGlobal
            }
        })
        .then((record: any) => {
            if (!record) {
                throw `I could ould not find Tally with name: [${isGlobal ? 'G' : 'C'}]` + tallyId;
            }
            return record;
        })
        .then((record: any) => {
            return Tally.update({
                    count: 0
                }, {
                    returning: true,
                    where: {
                        name: record.name
                    }
                })
                .then(() => record);
        })
        .then((record) => {
            const msg = {
                description: `
                [${isGlobal ? 'G' : 'C'}] **${tallyId}** has been emptied by **${message.author.toString()}**.
                `
            }

            helper.finalize(message);

            message.channel.send(helper.buildRichMsg(msg));
        })
        .catch((err) => {
            const msg = {
                description: `I couldn't empty [${isGlobal ? 'G' : 'C'}] **${tallyId}** because ${err}.
                \nempty attempted by **${message.author.toString()}**
                `
            }

            helper.finalize(message);

            message.channel.send(helper.buildRichMsg(msg));
        });
}