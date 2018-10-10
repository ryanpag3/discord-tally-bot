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
            const successMsg = {
                description: `${tallyId} has been deleted.`
            };

            const failMsg = {
                title: `${tallyId} doesn't exist in my database.`
            }
            if (res == 1)
                message.channel.send(helper.buildRichMsg(successMsg));
            else
                message.channel.send(helper.buildRichMsg(failMsg));
        });
}