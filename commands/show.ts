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
            const msg = {
                title: records.length == 0 ? 'No tallies could be found!' : 'Here are the existing tallies.\n',
                description: '',
                color: '#42f4e2',
                fields: records.map((record) => {
                    const description = record.description ? record.description : 'No description.';
                    return {
                        title: `${record.name} [${record.count}]`,
                        value: `${description}`
                    }
                })
            }
!
            message.channel.send(helper.buildRichMsg(msg));
        });
}