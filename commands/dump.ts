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
                    count: record.count - 1
                }, {
                    returning: true,
                    where: {
                        id: record.id
                    }
                })
                .then(() => record);
        })
        .then((record) => {
            message.channel.send('Oh snap! You just took a big :poop: on **' + record.id + '** and set it to ' + (record.count-1));
        });
}