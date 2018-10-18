import {
    Message
} from "discord.js";
import DB from '../util/db';
import helper from '../util/cmd-helper';

const Tally = DB.Tally;

export default (message: Message) => {
    let content = helper.removePrefixCommand(message.content, 2);
    let cArr = content.split(' ');
    let tallyId = cArr.shift();
    let amount = cArr.shift();

    if (!tallyId || !amount) {
        message.channel.send('ID and/or amount required. Please try again using the correct syntax. :wink:');
        return;
    }

    console.log('Setting [' + tallyId + '] to ' + amount);

    Tally.findOne({ where: {name: tallyId, channelId: message.channel.id}})
        .then((record: any) => {
            if (!record) throw `${'**'+tallyId+'**' || 'an empty string'} doesn't exist.`;

            return Tally.update({
                count: amount
            }, {
                returning: true,
                where: {
                    name: record.name,
                    channelId: message.channel.id
                }
            })
            .then(() => {
                record.count += 1;
                return record;
            });
        })
        .then((record) => {
            const msg = {
                description : `
                **${record.name}** is now ${amount}
                set by **${message.author.tag}**
                `
            }

            helper.finalize(message);

            message.channel.send(helper.buildRichMsg(msg));
        })
        .catch((err) => {
            const msg = {
                description: `
                I couldn't set **${name}** because ${err}
                set attempted by **${message.author.tag}**
                `
            }

            helper.finalize(message);

            message.channel.send(helper.buildRichMsg(msg));
        });
}