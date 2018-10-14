import {
    Message
} from "discord.js";
import DB from '../util/db';
import helper from '../util/cmd-helper';

const Tally = DB.tally;

export default (message: Message) => {
    const msg = message.content.split(' ');
    msg.shift(); // rm prefix
    msg.shift(); // rm command
    let tallyName = msg.shift();
    let bumpAmt: number = Number.parseInt(msg.shift());

    console.log('Bumping [' + tallyName + ']');

    Tally.findOne({where: {name: tallyName, channelId: message.channel.id}})
        .then((record: any) => {
            if (!record) {
                throw 'I couldn\'t find it. Check your spelling? :thinking:';
            }
            return record;
        })
        .then((record: any) => {
            const amt: number = bumpAmt ? bumpAmt : 1;
            return Tally.update({
                count: record.count + amt
            }, {
                returning: true,
                where: {
                    name: record.name,
                    channelId: message.channel.id
                }
            })
            .then(() => {
                record.count += amt;
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
