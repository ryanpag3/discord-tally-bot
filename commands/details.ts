// query for tally, print details
import {
    Message
} from "discord.js";
import DB from '../util/db';
import helper from '../util/cmd-helper';

const Tally = DB.Tally;

export default (message: Message) => {
    const isGlobal = helper.isGlobalTallyMessage(message);
    let msg = message.content.split(' ');
    msg.shift(); // rm prefix
    msg.shift(); // rm 'details'
    if (isGlobal) msg.shift(); // -g
    const name = msg.shift();

    console.log(`Giving ${name} details for channel ${message.channel.id}`);

    Tally.findOne({
        where: {
            channelId: message.channel.id,
            serverId: message.guild.id,
            isGlobal: isGlobal,
            name: name
        }
    })
        .then((record: any) => {
            const msg = {
                title: `[${isGlobal ? 'G' : 'C'}] **${record.name}**`,
                description: ``,
                color: '#42f4e2',
                fields: [
                    {
                        title: `Description`,
                        value: record.description == '' ? 'No description.' : record.description
                    },
                    {
                        title: `Count`,
                        value: `${record.count}`
                    }, 
                    {
                        title: `Requested by`,
                        value: message.author.toString()
                    }
                ]
            }

            helper.finalize(message);

            message.channel.send(helper.buildRichMsg(msg));
        })
        .catch((err) => {
            const msg = {
                description: `Could not find [${isGlobal ? 'G' : 'C'}] ${name}'s details.\nattempted by **${message.author.toString()}**.
                `
            }

            helper.finalize(message);
            message.channel.send(helper.buildRichMsg(msg));
        });
}