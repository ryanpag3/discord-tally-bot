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
    let amount = cArr.shift();

    if (!tallyId || !amount) {
        message.channel.send('ID and/or amount required. Please try again using the correct syntax. :wink:');
        return;
    }

    console.log('Setting [' + tallyId + '] to ' + amount);

    Tally.findOne({ where: {name: tallyId, channelId: message.channel.id}})
        .then((record: any) => {
            if (!record) {
                message.channel.send('Could not find Tally with ID: ' + tallyId);
                return;
            }
            return record;
        })
        .then((record: any) => {
            if (!record) throw 'I couldnt find it in my system! I didnt lose it. It doesnt exist!';

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
            // TODO add more phrases
            message.channel.send('Whoop Whoopy Whoop! **' + record.name +  '** is now at count: ' + amount);
        })
        .catch((err) => {
            message.channel.send('I couldn\'t bump that tally because ' + err);
        });
}