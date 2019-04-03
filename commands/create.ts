import {
    Message
} from "discord.js";
import moment from 'moment';
import {} from '../config.json';
import DB from '../util/db';
import helper from '../util/cmd-helper';
import help from "./help.js";

const Tally = DB.Tally;

const startDevDate = moment('2018-09-25'); // repo created date
const now = moment();
const daysExisted = now.diff(startDevDate, 'days');
const phrases = [
    `${daysExisted} days since last bug fix.`,
    `I hope you know what you're doing.`,
    `Tally Bot's my name, counting's my game.`,
    `Back to square one...?`,
    `This one's gunna be good. I can feel it.`,
    `Here's Johnny!`,
    `Hi mom!`,
    `Ash, what?!`,
    `Have you tried my fresh yung kokonut?`,
    `Petabytes and petabytes of 1..2...3...4...`,
    `>.<`,
    `Bump me bro!`,
    `Oh, that tickles!`,
    `Another one bumps the dust.`,
    `Oh no, not again.`,
    `I live! I die! I bump!`,
    `SKYNET protocol in 1...2...3`,
    `Game's rigged.`,
    `Joseph to the rescue!`,
    `Alvin made me.`,
    `Machine Learning Optimized:tm:`,
    `${daysExisted} forgotten birthdays.`
];

export default async (message: Message) => {
    let content = helper.removePrefixCommand(message.content, 2);
    let cArr = content.split(' ');
    let tallyId = cArr.shift();
    let tallyDescription = cArr.join(' '); // remainder is description

    if (!tallyId) {
        message.channel.send('Name is required to create Tally!');
        return;
    }

    try {
        console.log('Adding tally [' + tallyId + ']');
        await Tally.create({
            name: tallyId,
            channelId: message.channel.id,
            serverId: message.guild.id,
            description: tallyDescription,
            count: 0,
            keyword: null,
            isGlobal: false
        });
        const description = '\n' + (tallyDescription || 'no description');
        const successMsg = {
            title: `_"${helper.getRandomPhrase(phrases)}"_`,
            fields: [{
                    title: `Title`,
                    value: `${tallyId}`
                },
                {
                    title: `Description`,
                    value: `${description}\n\ncreated by **${message.author.toString()}**`
                }
            ]
        };

        helper.finalize(message);

        message.channel.send(helper.buildRichMsg(successMsg));
    } catch (err) {
        console.log('Failed to create tally. Reason: ' + err);

        helper.finalize(message);

        if (err.toString().indexOf('description') != -1) {
            const lengthMsg = {
                description: `**${message.author.toString()}**, please try again with a shorter description. Max length is 255 characters including spaces.`
            };
            message.channel.send(helper.buildRichMsg(lengthMsg));
        }
        const msg = {
            description: `
        **${tallyId}** already exists.
        attempted by **${message.author.toString()}**
        `
        }
        message.channel.send(helper.buildRichMsg(msg));
    }
}

async function getGlobalTallyExists(tallyName, serverId) {
    const tally = await Tally.findOne({
        where: {
            name: tallyName,
            serverId: serverId
        }
    });
    return tally != null;
}