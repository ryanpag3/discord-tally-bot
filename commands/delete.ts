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

    console.log('Deleting tally [' + tallyId + ']');
    Tally.destroy({
        where: {
            id: tallyId
        }
    })
        .then((res) => {
            if (res == 1)
                message.channel.send('Tally [' + tallyId + '] has been deleted. :cry:');
            else
                message.channel.send('Tally [' + tallyId + '] does not exist.');
        });
}