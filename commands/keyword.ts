import {
    Message
} from "discord.js";
import cmdHelper from "../util/cmd-helper";
import DB from '../util/db';
import db from "../util/db";

const Tally = DB.Tally;

// register listener
// create tally like normal
// send res
export default async (message: Message) => {
    const isGlobal = cmdHelper.isGlobalTallyMessage(message);
    let msg = message.content.split(' ');
    msg.shift(); // prefix
    msg.shift(); // !tb keyword
    if (isGlobal) msg.shift(); // -g
    const name = msg.shift();
    const keyword = msg.shift();
    const description = msg.shift() || 'no description';

    if (!name) {
        message.channel.send(cmdHelper.buildRichMsg({
            description: `A name must be provided for a keyword tally.\n\nRequested by ${message.author.toString()}`
        }));
        return;
    }

    if (!keyword) {
        message.channel.send(cmdHelper.buildRichMsg({
            description: `A keyword must be provided for a keyword tally.\n\nRequested by ${message.author.toString()}`
        }));
        return;
    }

    try {
        const result = await Tally.create({
            name: name,
            channelId: message.channel.id,
            serverId: message.guild.id,
            description: description,
            count: 0,
            keyword: keyword,
            isGlobal: isGlobal
        });
        let keywordMsg = '';
        keyword.split(',').map((key) => { // check for comma separated
            if (key == undefined || key == '') throw new Error('comma-separated keywords cannot be empty (i.e test,,key');
            keywordMsg += '**' + key + '**, '
        })
        keywordMsg = keywordMsg.slice(0, -2); // remove trailing or
        message.channel.send(cmdHelper.buildRichMsg({
            title: `Keyword Tally Created`, // todo add phrases
            fields: [{
                    title: `Name`,
                    value: `[${isGlobal ? 'G' : 'C'}] ${name}`
                },
                {
                    title: 'Keyword',
                    value: `${keyword}`
                },
                {
                    title: `Description`,
                    value: `${description}\n\ncreated by **${message.author.toString()}**\n\n` +
                    `This will tally every time ${keywordMsg} shows up in the chat automagically. :dizzy: :sparkles:`
                }
            ]
        }));
        console.log(`keyword tally  [${isGlobal ? 'G' : 'C'}] ${name} created.`);
    } catch (e) {
        if (e.toString().toLowerCase().indexOf('uniqueconstrainterror') != -1) e = 'tally alread exists';
        if (e.toString().toLowerCase().indexOf('incorrect string value') != -1) e = 'non-valid characters provided.';
        const err = `Failed to create keyword tally. Reason: ${e}`;
        console.log(err);
        message.channel.send(cmdHelper.buildRichMsg({
            description: `${err}\n` +
                `Requested by ${message.author.toString()}`
        }));
    }
};