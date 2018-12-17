// create an announcement
// set announcement goal
// change announcement goal
// set announcement timer
// change announcement timer
// make announce service for checking for announcements once a minute
// start on boot

import {
    Message
} from "discord.js";
import helper from '../util/cmd-helper';
import DB from '../util/db';

export default (message: Message) => {
    console.log(`${message.author.tag} called announce for channel ${message.channel.id}`);
    // announce "name" "description"
    // announce "name" -tally "tally name" -count "tally goal"
    // announce "name" -n "new name"
    // announce "name" -t "every monday"
    // announce "name" -d "updated description"
    let secondaryArg = false;
    const msg = message.content.split(' ');
    if (msg[3] && msg[3].startsWith('-')) {
        secondaryArg = true;
        msg[3] = msg[3].substr(1); // remove dash
    }

    switch (msg[3]) {
        case 'tally':
            setTally();
            break;
        case 'n':
            setName();
            break;
        case 't':
            setTime();
            break;
        case 'd':
            setDescription();
            break;
        default:
            // not correct argument or they actually want to make tally
            if (secondaryArg === true) msg[3] = '-' + msg[3]; 
            createAnnouncement();
            break;
    }

    function setTally() {

    }

    function setDate() {

    }

    function setName() {

    }

    function setTime() {

    }

    function setDescription() {

    }

    async function createAnnouncement() {
        console.log(`Creating announcement for ${message.author.tag}`);
        try {
            await DB.createAnnouncement(message.channel.id, msg[2], msg[3]);
            const richEmbed = {
                title: `:trumpet: Announcement Created! :trumpet:`,
                fields: [
                    {
                        title: 'Title',
                        value: msg[2]
                    },
                    {
                        title: 'Description',
                        value: msg[3] + `\n\n**Don't forget to activate your announcement with a date schedule or tally goal.**` +
                        `\n \`!tb announce ${msg[2]} -tally test-tally 1000\`` +
                        `\n \`!tb announce ${msg[2]} -t every monday\`` +
                        `\n\ncreated by **${message.author.toString()}**`
                    }
                ]
            }
            helper.finalize(message);
            message.channel.send(helper.buildRichMsg(richEmbed));
        } catch (e) {
            console.log('Failed to create tally. Reason: ' + e);
        
            helper.finalize(message);
    
            if (e.toString().indexOf('description') != -1) {
                const lengthMsg = {
                    description: `**${message.author.toString()}**, please try again with a shorter description. Max length is 255 characters including spaces.`
                };
                message.channel.send(helper.buildRichMsg(lengthMsg));
            }
            const richEmbed = {
                description: `
                The announcement **${msg[2]}** already exists.
                attempted by **${message.author.toString()}**
                `
            }
            message.channel.send(helper.buildRichMsg(richEmbed));
        }
    }
}