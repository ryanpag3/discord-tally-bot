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
    let content = helper.removePrefixCommand(message.content, 2);
    let cArr = content.split(' ');
    let tallyId = cArr.shift();

    console.log('Deleting tally [' + tallyId + ']');

    Tally.findOne({ where: {name: tallyId, channelId: message.channel.id}})
        .then((record: any) => {
            if (!record) {
                throw 'I could ould not find Tally with name: ' + tallyId;
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
                description : `
                **${tallyId}** has been emptied by **${message.author.toString()}**.
                `
            }
            
            helper.finalize(message);

            message.channel.send(helper.buildRichMsg(msg));
        })
        .catch((err) => {
            const msg = {
                description: `I couldn't empty **${tallyId}** because ${err}.
                \nempty attempted by **${message.author.toString()}**
                `
            }

            helper.finalize(message);

            message.channel.send(helper.buildRichMsg(msg));
        });
}