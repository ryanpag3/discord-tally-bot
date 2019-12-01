import {
    Message
} from "discord.js";
import DB from '../util/db';
import helper from '../util/cmd-helper';
import cmdHelper from "../util/cmd-helper";

export default async(message: Message) => {
    const db = new DB();
    const isGlobal = cmdHelper.isGlobalTallyMessage(message);
    let msg = message.content.split(' ');
    msg.shift(); // prefix
    msg.shift(); // command
    if (isGlobal) msg.shift(); // -g
    const page: number = Number.parseInt(msg.shift()) || 1;

    console.log(`Showing tallies for channel [${isGlobal ? 'G' : 'C'}] [' + ${message.channel.id} + ']`);

    try {
        let tallies = await db.getTallies(
            message.channel.id,
            message.guild.id,
            isGlobal
        );
        
        tallies = tallies.sort((a, b) => {
            if (a.count > b.count) return -1;
            if (a.count < b.count) return 1;
            return 0;
        });
        const total = tallies.length;
        const pageSize = 20;
        const totalPages = Math.floor(tallies.length / pageSize) == 0 ? 1 : Math.floor(tallies.length / pageSize) + 1; 
        tallies = cmdHelper.handlePagination(pageSize, page, tallies);
        
        let talliesMsg = '';
        tallies.map((record) => {
            const description = record.description && record.description != '' ? record.description : undefined;

            talliesMsg += `[${isGlobal ? 'G' : 'C'}] [${record.count}] **${record.name}** • ${description ? '_' + truncate(description, 50) + '_' : 'no description.'}
            `;
        });
        talliesMsg += `\nIf you would like details on a tally, type \`!tb get <name>\`
        
shown for **${message.author.toString()}**
        `;


        const msg = {
            title: tallies.length == 0 ? 'No tallies could be found!' : `Here are the existing tallies. \nPage ${page} of ${totalPages} :star: ${total} total tallies\nTry \`!tb show [number]\` to show next page\n`,
            description: talliesMsg,
            color: '#42f4e2'
        }

        helper.finalize(message);

        message.channel.send(helper.buildRichMsg(msg));
    } catch (e) {
        const msg = {
            description: `An error occured while attempting to show tallies. ${e}`
        };
        helper.finalize(message);
        message.channel.send(helper.buildRichMsg(msg));
    }
}

function truncate(string, len){
    if (string.length > len)
       return string.substring(0,len)+'...';
    else
       return string;
 };