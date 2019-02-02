import {
    Message
} from "discord.js";
import cronParser from 'cron-parser';
import { CronJob } from 'cron';
import helper from '../util/cmd-helper';
import DB from '../util/db';
import CronAnnouncer from '../util/cron-announcer';

// !tb announce tt -t test-tally 1000
// !tb announce tt -d next monday
// !tb announce tt -d * * * * *

// !tb announce tt test description
// !tb announce tt -t test-tally 1000

export default (message: Message) => {
    console.log('Running test command for channel [' + message.channel.id + ']');
    const msg = message.content.split(' ');
    const announceName = msg[2];
    const subArg = msg[3];
    try {
        switch (subArg) {
            case '-t':
                setTallyGoal();
                break;
            case '-d':
                setDateGoal();
                break;
            case '-kill':
                killAnnouncement();
                break;
            case '-activate':
                activateAnnouncement();
                break;
            default:
                createAnnouncement();
                break;
        }
    } catch (e) {
        console.log('Announcement command failed. Reason: ' + e);
        helper.finalize(message);
        const richEmbed = {
            description: `Announcement command failed. Reason ${e}`
        };
        message.channel.send(helper.buildRichMsg(richEmbed));
    }

    async function setTallyGoal() {
        console.log(`Setting tally goal for ${message.author.tag}`);
        const channelId = message.channel.id;
        const goalName: string = msg[4], goalCount: string = msg[5];
        
        if (!goalCount) throw new Error(`Goal count is required to set tally goal.`);

        await DB.setAnnounceTallyGoal(channelId, announceName, goalName, goalCount);

        const richEmbed = {
            title: `:trumpet: Announcement Tally Goal Set! :trumpet:`,
            fields: [
                {
                    title: `Title`,
                    value: announceName
                },
                {
                    title: `When this announcement will trigger`,
                    value: `Once **${goalName}** reaches ${goalCount}.`
                }
            ]
        }
        finalize(richEmbed);
    }

    async function setDateGoal() {
        console.log(`Setting date goal for ${message.author.tag}.`);
        const datePattern = msg.slice(4, msg.length).join(' ');
        if (!isValidDate(datePattern) && !isValidCron(datePattern))
            throw new Error(`Invalid date pattern provided.\n` +
            `If your event fires once, please use a valid date. If it repeats, please make sure it is a valid CRON pattern.\n` +
            `You can refer here for help: https://crontab.guru/`);
        
        let date;
        if (isValidDate(datePattern)){
            console.log('Using date pattern to create date object.');
            date = new Date(datePattern);
            console.log(date);
        }

        await DB.setAnnounceDate(message.channel.id, announceName, datePattern);

        CronAnnouncer.createCronJob(announceName, message.channel.id, date || datePattern);

        const richEmbed = {
            title: `:trumpet: Announcement Date Goal Set! :trumpet:`,
            fields: [
                {
                    title: `Title`,
                    value: announceName
                },
                {
                    title: `When announcement will run`,
                    value: date ? date.toLocaleDateString() + ' ' + date.toLocaleTimeString() : datePattern
                }
            ]
        }
        finalize(richEmbed);
    }

    async function killAnnouncement() {
        CronAnnouncer.destroyCronJob(announceName, message.channel.id);
        helper.finalize(message);
        const richEmbed = {
            description: `Announcement will not run anymore.`
        };
        message.channel.send(helper.buildRichMsg(richEmbed));
    }

    async function activateAnnouncement() {
        const announce: any = await DB.Announcement.findOne({ where: {
            channelId: message.channel.id, 
            name: announceName
        }});
        DB.activateAnnouncement(message.channel.id, announceName);
        if (!announce) return;
        CronAnnouncer.createCronJob(announceName, message.channel.id, announce.datePattern);
        helper.finalize(message);
        const richEmbed = {
            description: `Announcement will start running again.`
        };
        message.channel.send(helper.buildRichMsg(richEmbed));
    }

    async function createAnnouncement() {
        console.log(`Creating announcement for ${message.author.tag}`);
        try {
            const noDescription = 'no description.';
            await DB.createAnnouncement(message.channel.id, msg[2], msg[3] || noDescription);
            const richEmbed = {
                title: `:trumpet: Announcement Created! :trumpet:`,
                fields: [
                    {
                        title: 'Title',
                        value: msg[2]
                    },
                    {
                        title: 'Description',
                        value: (msg[3] || noDescription) + `\n\n**Don't forget to activate your announcement with a date schedule or tally goal.**` +
                        `\n \`!tb announce ${msg[2]} -t test-tally 1000\`` +
                        `\n \`!tb announce ${msg[2]} -d 0 6 * * *\`` +
                        `\n \`!tb announce ${msg[2]} -d 07-14-2042 01:01:00 AM\`` +
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
                throw new Error(lengthMsg.description);
            }
            throw e;
        }

    }

    function finalize(richEmbed) {
        helper.finalize(message);
        message.channel.send(helper.buildRichMsg(richEmbed));
    }

    function isValidDate(d) {
        const ts = Date.parse(d);
        return isNaN(ts) == false;
    }

    function isValidCron(cronPattern) {
        try {
            cronParser.parseExpression(cronPattern);
            return true;
        } catch (e) {
            return false;
        }
    }
}