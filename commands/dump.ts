import {
    Message
} from "discord.js";
import DB from '../util/db';
import helper from '../util/cmd-helper';

const Tally = DB.tally;

export default (message: Message) => {
    let msg = message.content.split(' ');
    msg.shift(); // prefix
    msg.shift(); //command;
    let tallyName = msg.shift();

    const dumpAmt = Number.parseInt(msg.shift());


    console.log('Dumping tally [' + tallyName + ']');

    const phrases = [
        `Oh snap! You just took a big :poop:`,
        `What happened?!`,
        `Turn that bump upside down! :upside_down:`
    ]
    
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
                        channelId: message.channel.id
                    }
                })
                .then(() => {
                    record.count -= amt;
                    return record;
                });
        })
        .then((record) => {
            const msg = {
                description: `**${record.name}** is now at count ${record.count}`
            };
            message.channel.send(helper.buildRichMsg(msg));
        })
        .catch((err) => {
            const failMsg = {
                description: `I couldn't dump that tally because ${err}`
            }
            message.channel.send(helper.buildRichMsg(failMsg));
        });
}