import {
    Message
} from "discord.js";
import { table } from 'table';
import { prefix } from '../config.json';
import DB from '../util/db';
import helper from '../util/cmd-helper';
import cmdHelper from "../util/cmd-helper";

const Tally = DB.Tally;

export default (message: Message) => {
    let msg = message.content.split(' ');
    msg.shift(); // prefix
    msg.shift(); // command
    const page: number = Number.parseInt(msg.shift()) || 1;

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
            const total = records.length;
            const pageSize = 20;
            const totalPages = Math.floor(records.length / pageSize) == 0 ? 1 : Math.floor(records.length / pageSize) + 1; 
            records = cmdHelper.handlePagination(pageSize, page, records);
            
            let tallies = '';
            records.map((record) => {
                const description = record.description && record.description != '' ? record.description : undefined;

                tallies += `[${record.count}] **${record.name}** • ${description ? '_' + truncate(description, 50) + '_' : 'no description.'}
                `;
            });
            tallies += `\nIf you would like details on a tally, type \`!tb get <name>\`
            
shown for **${message.author.toString()}**
            `;


            const msg = {
                title: records.length == 0 ? 'No tallies could be found!' : `Here are the existing tallies. \nPage ${page} of ${totalPages} :arrow_right: ${total} total tallies.\nTry \`!tb show [number]\` to show next page\n`,
                description: tallies,
                color: '#42f4e2'
            }
!

            helper.finalize(message);

            message.channel.send(helper.buildRichMsg(msg));
        });
}

function truncate(string, len){
    if (string.length > len)
       return string.substring(0,len)+'...';
    else
       return string;
 };