import {
    Message
} from "discord.js";
import DB from '../util/db';
import helper from '../util/cmd-helper';

const Tally = DB.tally;

export default (message: Message) => {
    let content = helper.removePrefixCommand(message.content, 2);
    let cArr = content.split(' ');
    let tallyId = cArr.shift();

    console.log('Bumping [' + tallyId + ']');

    Tally.findOne({where: {name: tallyId, channelId: message.channel.id}})
        .then((record: any) => {
            if (!record) {
                throw 'I couldn\'t find it. Check your spelling? :thinking:';
            }
            return record;
        })
        .then((record: any) => {
            return Tally.update({
                count: record.count + 1
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
                description: `**${record.name}** is now ${record.count}`
            }
            message.channel.send(helper.buildRichMsg(msg));
        })
        .catch((err) => {
            const msg = {
                description: `I couldn't bump that tally because ${err}`
            }
            message.channel.send(helper.buildRichMsg(msg));
        });
}
