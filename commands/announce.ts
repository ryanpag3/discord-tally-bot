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
import chrono from 'chrono-node';
import moment from 'moment';
import helper from '../util/cmd-helper';
import DB from '../util/db';

export default (message: Message) => {
    console.log(`${message.author.tag} called announce for channel ${message.channel.id}`);
    let secondaryArg = false;
    const msg = message.content.split(' ');
    if (msg[3] && msg[3].startsWith('-')) {
        secondaryArg = true;
        msg[3] = msg[3].substr(1); // remove dash
    }

    switch (msg[3]) {
        case 'tally':
            validateSecondArg()
            setTally();
            break;
        case 'date':
            validateSecondArg()
            setDate();
            break;
        case 'locale':
            validateSecondArg()
            setLocale();
            break;
        case 'n':
            validateSecondArg()
            setName();
            break;
        case 'd':
            validateSecondArg()
            setDescription();
            break;
        case 'rm':
            deleteAnnounce();
            break;
        default:
            // not correct argument or they actually want to make tally
            if (secondaryArg === true) msg[3] = '-' + msg[3]; 
            createAnnouncement();
            break;
    }

    async function setTally() {
        console.log(`Setting tally goal for ${message.author.tag}`);
        try {
            if (!msg[5]) throw new Error('Count is required for tally goal.');
            await DB.setAnnounceTallyGoal(message.channel.id, msg[2], msg[4], msg[5]);
            const richEmbed = {
                title: `:trumpet: Announcement Tally Goal Set! :trumpet:`, 
                fields: [
                    {
                        title: 'Title',
                        value: msg[2]
                    },
                    {
                        title: `When announce will run`,
                        value: 'Once **' + msg[4] + '** reaches ' + msg[5] + ' tallies.'
                    }
                ]
                
            }
            helper.finalize(message);
            message.channel.send(helper.buildRichMsg(richEmbed));
        } catch (e) {
            console.log('Failed to update announcement with tally goal. Reason: ' + e);
        
            helper.finalize(message);
    
            const richEmbed = {
                description: `Failed to update announcement with tally goal. Reason: ${e}`
            }
            message.channel.send(helper.buildRichMsg(richEmbed));        
        }
    }

    async function setDate() {
        console.log(`Setting date for ${message.author.tag}`);
        try {
            const now = moment();
            const dateStr = msg.slice(4, msg.length).join(' ');
            const parsed = chrono.parse(dateStr);
            const timeFrom = moment(parsed[0].start.date()).from(now)
            await DB.setAnnounceDate(message.channel.id, msg[2], dateStr);
            const richEmbed = {
                title: `:trumpet: Announcement Date Goal Set! :trumpet:`, 
                fields: [
                    {
                        title: 'Title',
                        value: msg[2]
                    },
                    {
                        title: `When announce will run`,
                        value: `"${dateStr}" \n_or_\n${timeFrom}`
                    }
                ]
                
            }
            helper.finalize(message);
            message.channel.send(helper.buildRichMsg(richEmbed));
        } catch (e) {
            console.log('Failed to update announcement with date. Reason: ' + e);
        
            helper.finalize(message);
    
            const richEmbed = {
                description: `Failed to update announcement with date. Reason: ${e}`
            }
            message.channel.send(helper.buildRichMsg(richEmbed));        
        }
    }

    async function setName() {
        console.log(`Setting name for ${message.author.tag}`);
        try {
            await DB.setAnnounceName(message.channel.id, msg[2], msg[4]);
            const richEmbed = {
                title: `:trumpet: Announcement Name set! :trumpet:`, 
                fields: [
                    {
                        title: 'New name',
                        value: msg[4]
                    }
                ]
                
            }
            helper.finalize(message);
            message.channel.send(helper.buildRichMsg(richEmbed));
        } catch (e) {
            console.log('Failed to update announcement with name. Reason: ' + e);
        
            helper.finalize(message);
    
            const richEmbed = {
                description: `Failed to update announcement with name. Reason: ${e}`
            }
            message.channel.send(helper.buildRichMsg(richEmbed));        
        }
    }

    async function setDescription() {
        console.log(`Setting description for ${message.author.tag}`);
        try {
            const desc = msg.slice(4, msg.length).join(' ');
            await DB.setAnnounceDesc(message.channel.id, msg[2], desc);
            const richEmbed = {
                title: `:trumpet: Announcement Description! :trumpet:`, 
                fields: [
                    {
                        title: 'Title',
                        value: msg[2]
                    },
                    {
                        title: 'New description',
                        value: desc
                    }
                ]
                
            }
            helper.finalize(message);
            message.channel.send(helper.buildRichMsg(richEmbed));
        } catch (e) {
            console.log('Failed to update announcement with name. Reason: ' + e);
        
            helper.finalize(message);
    
            const richEmbed = {
                description: `Failed to update announcement with name. Reason: ${e}`
            }
            message.channel.send(helper.buildRichMsg(richEmbed));        
        }
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
                        `\n \`!tb announce ${msg[2]} -date monday at 9am\`` +
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

    async function deleteAnnounce() {
        console.log(`Deleting announcement for ${message.author.tag}`);
        try {
            const desc = msg.slice(4, msg.length).join(' ');
            await DB.deleteAnnounce(message.channel.id, msg[2]);
            const richEmbed = {
                description: `${msg[2]} has been deleted.\n\ndeleted by ${message.author.toString()}`
                
            }
            helper.finalize(message);
            message.channel.send(helper.buildRichMsg(richEmbed));
        } catch (e) {
            console.log('Failed to delete. Reason: ' + e);
        
            helper.finalize(message);
    
            const richEmbed = {
                description: `Failed to delete. Reason: ${e}`
            }
            message.channel.send(helper.buildRichMsg(richEmbed));        
        }
    }

    async function setLocale() {
        
    }

    function validateSecondArg() {
        if (!msg[4]) throw new Error('If using a secondary argument for announcements, you need to provide a value.');
    }
}