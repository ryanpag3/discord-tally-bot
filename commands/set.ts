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

    console.log(typeof amount);

    console.log('Setting [' + tallyId + '] to ' + amount);

    Tally.findById(tallyId)
        .then((record: any) => {
            if (!record) {
                message.channel.send('Could not find Tally with ID: ' + tallyId);
                return;
            }
            return record;
        })
        .then((record: any) => {
            return Tally.update({
                count: amount
            }, {
                returning: true,
                where: {
                    id: record.id
                }
            })
            .then(() => {
                record.count += 1;
                return record;
            });
        })
        .then((record) => {
            // TODO add more phrases
            message.channel.send('Whoop Whoopy Whoop! **' + record.id +  '** is now at count: ' + amount);
        });
}