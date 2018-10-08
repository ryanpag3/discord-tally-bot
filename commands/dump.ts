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

    console.log('Dumping tally [' + tallyId + ']');

    const phrases = [
        `Oh snap! You just took a big :poop:`,
        `What happened?!`,
        `Turn that bump upside down! :upside_down:`
    ]
    
    Tally.findOne({ where: {name: tallyId, channelId: message.channel.id}})
        .then((record: any) => {
            if (!record) {
                throw 'I couldn\'t find it in my system. Hmm... :thinking:';
            }
            return record;
        })
        .then((record: any) => {
            return Tally.update({
                    count: record.count - 1
                }, {
                    returning: true,
                    where: {
                        name: record.name,
                        channelId: message.channel.id
                    }
                })
                .then(() => record);
        })
        .then((record) => {
            const msg = {
                title: helper.getRandomPhrase(phrases),
                description: `**${record.name}** is now at count ${record.count - 1}`
            };
            message.channel.send(helper.buildRichMsg(msg));
        })
        .catch((err) => {
            const failMsg = {
                title: `I couldn't dump that tally because ${err}`
            }
            message.channel.send(helper.buildRichMsg(failMsg));
        });
}