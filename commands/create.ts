import { Message } from "discord.js";
import DB from '../util/db';
import helper from '../util/cmd-helper';

const Tally = DB.tally;

export default (message: Message) => {
    let content = helper.removePrefixCommand(message.content, 2);
    let cArr = content.split(' ');
    let tallyId = cArr.shift();
    let tallyDescription = cArr.join(' '); // remainder is description

    if (!tallyId) {
        message.channel.send('Name is required to create Tally!');
        return;
    }

    console.log('Adding tally [' + tallyId + ']');
    Tally.insertOrUpdate({
        name: tallyId,
        channelId: message.channel.id,
        description: tallyDescription,
        count: 0
    }).then((res) => {
        if (res == true)
            message.channel.send('Tally has been created with name [' + tallyId + ']' + (tallyDescription ? ' and description: ' + tallyDescription : ''));
        else
            message.channel.send('Tally already exists with name [' + tallyId + ']');
    })
}