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

    if (!tallyId) {
        message.channel.send('Name is required to delete!')
        return;
    }

    console.log('Deleting tally [' + tallyId + ']');
    Tally.destroy({
        where: {
            name: tallyId,
            channelId: message.channel.id
        }
    })
        .then((res) => {
            if (res == 1)
                message.channel.send('Tally [' + tallyId + '] has been deleted. :cry:');
            else
                message.channel.send('Doesn\'t seem to exist on my system. Job done? I guess? :wink:');
        });
}