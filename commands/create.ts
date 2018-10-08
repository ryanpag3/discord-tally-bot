import { Message } from "discord.js";
import moment from 'moment';
import DB from '../util/db';
import helper from '../util/cmd-helper';

const Tally = DB.tally;

const startDevDate = moment('2018-09-25'); // repo created date
const now =  moment();
const daysExisted = now.diff(startDevDate, 'days');
const phrases = [
    `${daysExisted} days since last bug fix.`,
    `I hope you know what you're doing.`,
    `Tally Bot's my name, counting's my game.`
];

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
        const description = '\n' + (tallyDescription || 'No description.');
        const msg = {
            title: `_"${helper.getRandomPhrase(phrases)}"_`,
            fields: [
                {
                    title: `${tallyId}`,
                    value: `${description}\n\ncreated by **${message.member.user.tag}**`
                }
            ]
        }
        if (res == true)
            message.channel.send(helper.buildRichMsg(msg));
        else
            message.channel.send('Tally already exists with name [' + tallyId + ']');
    })
}