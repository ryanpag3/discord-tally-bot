import {
    Message
} from "discord.js";
import { table } from 'table';
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
            records = records.sort((a, b) => {
                if (a.count > b.count) return -1;
                if (a.count < b.count) return 1;
                return 0;
            });
            let tallies = '';
            records.map((record) => {
                tallies += `[${record.count}] **${record.name}**\n`;
            });
            tallies += `\nIf you would like details on a tally, type \`!tb get <name>\``;
            const msg = {
                title: records.length == 0 ? 'No tallies could be found!' : 'Here are the existing tallies.\n',
                description: tallies,
                color: '#42f4e2'
            }
!
            message.channel.send(helper.buildRichMsg(msg));
        });
}