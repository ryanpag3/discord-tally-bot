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
                        channel: message.channel.id
                    }
                })
                .then(() => record);
        })
        .then((record) => {
            message.channel.send('Oh snap! You just took a big :poop: on **' + record.name + '** and set it to ' + (record.count-1));
        })
        .catch((err) => {
            message.channel.send('We couldn\'t bump that tally because ' + err);
        });
}