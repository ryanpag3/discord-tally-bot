import {
    Message
} from "discord.js";
import { prefix } from '../config.json';
import DB from '../util/db';
import helper from '../util/cmd-helper';

const Tally = DB.tally;

export default (message: Message) => {
    let content = helper.removePrefixCommand(message.content, 2);
    let cArr = content.split(' ');

    console.log('Showing tallies for channel [' + message.channel.id + ']');

    Tally.findAll({
        where: {
            channelId: message.channel.id
        }
    })
        .then((records: any) => {
            let tallies = records.length == 0 ? 'No tallies could be found!' : 'Here are the existing tallies.\n';
            for (let record of records) {
                tallies += '- [' + record.count + '] **' + record.name + '** ' + (record.description ? ': ' + record.description : '') +  '\n';
            }
            tallies += 'You can bump them by running ' + prefix + 'bump <ID>\n';
            message.channel.send(tallies);
        });
}