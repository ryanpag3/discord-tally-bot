import { Message } from 'discord.js';
import DB from '../../util/db';
import MsgHelper from '../msg-helper';
import logger from '../../util/logger';
import { getEmoji } from '../../static/MsgEmojis';
import Commands from '../../static/Commands';
import CronParser from 'cron-parser';
import Env from '../../util/env';
import CronDeployer from '../../util/cron-deployer';

/**
 * !tb announce -alert [comma,separated,tally,names] [cron_expression]
 * !tb announce -create [name] [description]
 * !tb announce -delete [name]
 * !tb announce -goal [name] -[date] [date-pattern]
 * !tb announce -goal [name] -[tally] [tally_name] [amount]
 * !tb announce -enable [name]
 * !tb announce -disable [name]
 */
const db = new DB();

enum AnnounceTypes {
    D = '-d',
    DATE = '-date',
    T = '-t',
    TALLY = '-tally',
}

enum SubCommands {
    ALERT = '-alert',
    A = '-a',
    CREATE = '-create',
    C = '-c',
    DELETE = '-delete',
    D = '-d',
    GOAL = '-goal', // -g is reserved for global flags
    ENABLE = '-enable',
    DISABLE = '-disable',
    GET = '-get',
    GENERATE = '-generate'
}

const MAX_ANNOUNCEMENTS = 50;

export default class AnnounceHandler {
    static async runAnnounce(message: Message) {
        try {
            const subcommand = AnnounceHandler.getSubcommand(message);
            switch (subcommand) {
                case SubCommands.A:
                case SubCommands.ALERT:
                    return await AnnounceHandler.runCreateAlertAnnouncement(message);
                case SubCommands.C:
                case SubCommands.CREATE:
                    return await AnnounceHandler.runCreateAnnouncement(message);
                case SubCommands.D:
                case SubCommands.DELETE:
                    return await AnnounceHandler.runDeleteAnnouncement(message);
                case SubCommands.GET:
                    return await AnnounceHandler.runGetAnnouncement(message);
                case SubCommands.GOAL:
                    return await AnnounceHandler.runSetAnnouncementGoal(message);
                case SubCommands.ENABLE:
                    return await AnnounceHandler.runEnableAnnouncement(message);
                case SubCommands.DISABLE:
                    return await AnnounceHandler.runDisableAnnouncement(message);
                case SubCommands.GENERATE:
                    return await AnnounceHandler.runGenerateAnnouncements(message); // internal only
                default:
                    return await AnnounceHandler.runDisplayHelp(message);
            }
        } catch (e) {
            MsgHelper.handleError(`An error occured while running an announcement command.`, e, message);
        }
    }

    static getSubcommand(message: Message) {
        const split = message.content.split(' ');
        const subcommand = split[2];
        if (!subcommand) return;
        if (!Object.values(SubCommands).includes(subcommand as any)) AnnounceHandler.raiseInvalidSubcommand();
        return subcommand;
    }

    static raiseInvalidSubcommand() {
        throw new Error(`A valid subcommand is required. Valid subcommands are ${Object.values(SubCommands).join(', ')}`);
    }

    static raiseInvalidType() {
        throw new Error(`A valid type is required. Valid types are ${Object.values(AnnounceTypes).join(', ')}`);
    }

    static async runCreateAnnouncement(message: Message) {
        try {
            const { name, description, command } = AnnounceHandler.unmarshallCreateMessage(message);
            await AnnounceHandler.checkIfMaxAnnouncementsReached({ channelId: message.channel.id });
            await db.upsertAnnouncement(message.channel.id, name, description);
            const announcement = await db.getAnnouncement(message.channel.id, name);
            if (!announcement) throw new Error('Announcement was not created successfully. Please try again.');
            const richEmbed = MsgHelper.getRichEmbed(message.author.username)
                .setTitle(`:trumpet: ${command}`)
                .setDescription(
                    `Announcement has been created.\n\n**name:** ${name}\n**description:** ${
                        description || 'no description'
                    }\n\nDon't forget to set goal with \`!tb announce -goal\`. Syntax [here](https://github.com/ryanpag3/discord-tally-bot#set-announcement-tally-goal)`
                );
            logger.info(`Announcement created [${name}] for user [${message.author.id}]`);
            MsgHelper.sendMessage(message, richEmbed);
        } catch (e) {
            MsgHelper.handleError(`An error occured while creating announcement.`, e, message);
        }
    }

    private static unmarshallCreateMessage(
        message: Message
    ): {
        name: string;
        description: string;
        command: string;
    } {
        const split = message.content.split(' ');
        const command = [split[0], split[1], split[2]].join(' ');
        const name = split[3];
        if (!name)
            throw new Error(
                `Please provide a valid unique name for this announcement. See [here](https://github.com/ryanpag3/discord-tally-bot#create-an-announcement) for syntax.`
            );
        const description = split.slice(4, split.length).join(' ');
        return {
            name,
            description,
            command,
        };
    }

    static async runDeleteAnnouncement(message: Message) {
        try {
            const { name, command } = AnnounceHandler.unmarshallDeleteMessage(message);
            const resultCode = await db.deleteAnnounce(message.channel.id, name);
            if (resultCode === 0) throw new Error(`No announcement found with name [${name}] to delete.`);
            const richEmbed = MsgHelper.getRichEmbed(message.author.username).setTitle(`:x: ${command}`).setDescription(`Announcement with name **${name}** has been deleted.`);
            logger.info(`Deleted announcement with name [${name}] and author id [${message.author.id}]`);
            MsgHelper.sendMessage(message, richEmbed);
        } catch (e) {
            MsgHelper.handleError(`An error occured while deleting announcement.`, e, message);
        }
    }

    static unmarshallDeleteMessage(
        message: Message
    ): {
        name: string;
        command: string;
    } {
        const split = message.content.split(' ');
        const command = [split[0], split[1], split[2]].join(' ');
        if (!split[3]) throw new Error(`Name is required for announcement deletion.`);
        return {
            name: split[3],
            command,
        };
    }

    static async runSetAnnouncementGoal(message: Message) {
        try {
            const { type } = AnnounceHandler.unmarshallAnnouncementGoalMessage(message);
            switch (type) {
                case AnnounceTypes.T:
                case AnnounceTypes.TALLY:
                    return await AnnounceHandler.setAnnouncementTallyGoal(message);
                case AnnounceTypes.D:
                case AnnounceTypes.DATE:
                    return await AnnounceHandler.setAnnouncementDateGoal(message);
                default:
                    AnnounceHandler.raiseInvalidType();
            }
        } catch (e) {
            MsgHelper.handleError(`An error occured while setting announcement goal.`, e, message);
        }
    }

    /**
     * !tb announce -goal [name] -[date] [date-pattern]
     * !tb announce -goal [name] -[tally] [tally_name] [amount]
     * @param message
     */
    static unmarshallAnnouncementGoalMessage(
        message: Message
    ): {
        type: string;
    } {
        const split = message.content.split(' ');
        const type = split[4];
        if (!type) AnnounceHandler.raiseInvalidType();
        return {
            type,
        };
    }

    static async setAnnouncementTallyGoal(message: Message) {
        const { name, tallyName, count, command } = AnnounceHandler.unmarshallTallyGoalMessage(message);
        await db.setAnnounceTallyGoal(message.channel.id, name, tallyName, count);
        const richEmbed = MsgHelper.getRichEmbed(message.author.username)
            .setTitle(`:trumpet: ${command}`)
            .setDescription(`Announcement **${name}** has been set to alert when tally **${tallyName}** reaches ${count}.`);
        logger.info(`announcement [${name}] has been set to trigger when [${tallyName}] reaches [${count}] by user [${message.author.id}] for channel [${message.channel.id}]`);
        MsgHelper.sendMessage(message, richEmbed);
    }

    static unmarshallTallyGoalMessage(
        message: Message
    ): {
        command: string;
        name: string;
        tallyName: string;
        count: number;
    } {
        const split = message.content.split(' ');
        const command = [split[0], split[1], split[2]].join(' ');
        const name = split[3],
            tallyName = split[5],
            count = Number.parseInt(split[6]);
        if (!name) throw new Error(`A valid announcement name is required. For more info click [here](https://github.com/ryanpag3/discord-tally-bot#set-announcement-tally-goal)`);
        if (!tallyName) throw new Error(`A valid tally name is required. For more info click [here](https://github.com/ryanpag3/discord-tally-bot#set-announcement-tally-goal)`);
        if (!count || Number.isNaN(count))
            throw new Error('A valid count is required. For more info click [here](https://github.com/ryanpag3/discord-tally-bot#set-announcement-tally-goal)');
        return {
            command,
            name,
            tallyName,
            count,
        };
    }

    static async setAnnouncementDateGoal(message: Message) {
        const { command, datePattern, name } = AnnounceHandler.unmarshallDateGoalMessage(message);
        let date: Date;
        if (AnnounceHandler.isValidDate(datePattern)) date = new Date(datePattern);
        const a = await db.setAnnounceDate(message.channel.id, name, datePattern);
        await CronDeployer.deployAnnouncement(a);
        const richEmbed = MsgHelper.getRichEmbed(message.author.username)
            .setTitle(`:trumpet: ${command}`)
            .setDescription(`The announcement **${name}** will run on **${getFormattedDateStr()}**`);
        MsgHelper.sendMessage(message, richEmbed);

        function getFormattedDateStr() {
            return date ? date.toLocaleDateString() + ' ' + date.toLocaleTimeString() : datePattern;
        }
    }

    static unmarshallDateGoalMessage(
        message: Message
    ): {
        command: string;
        datePattern: string;
        name: string;
    } {
        const { isValidDate, isValidCron } = AnnounceHandler;
        const split = message.content.split(' ');
        const command = [split[0], split[1], split[2]].join(' ');
        const name = split[3];
        if (!name) throw new Error(`Announcement name is required for setting date goal.`);
        const datePattern = split.slice(5, split.length).join(' ');
        if (!isValidDate(datePattern) && !isValidCron(datePattern)) {
            AnnounceHandler.raiseInvalidDatePattern();
        }
        return {
            command,
            datePattern,
            name,
        };
    }

    static raiseInvalidDatePattern() {
        throw new Error(
            `Invalid date pattern provided.\n` +
                `If your event fires once, please use a valid date. If it repeats, please make sure it is a valid CRON pattern.\n` +
                `You can refer here for help: https://crontab.guru/`
        );
    }

    static isValidDate(d: string) {
        const parsed = Date.parse(d);
        return isNaN(parsed) === false;
    }

    static isValidCron(cron: string) {
        try {
            CronParser.parseExpression(cron);
            return true;
        } catch (e) {
            return false;
        }
    }

    static async runEnableAnnouncement(message: Message) {
        try {
            const { name, command } = AnnounceHandler.unmarshallToggleMessage(message);
            const a = await db.activateAnnouncement(message.channel.id, name);
            if (!a) throw new Error(`Could not find announcement to enable.`);
            if (a.datePattern)
                CronDeployer.deployAnnouncement(a);
            const richEmbed = MsgHelper.getRichEmbed(message.author.username)
                .setTitle(`:trumpet: :flashlight: ${command}`)
                .setDescription(`Announcement **${name}** has been enabled.`);
            MsgHelper.sendMessage(message, richEmbed);
        } catch (e) {
            MsgHelper.handleError(`An error occured while enabling announcement.`, e, message);
        }
    }

    static async runDisableAnnouncement(message: Message) {
        try {
            const { name, command } = AnnounceHandler.unmarshallToggleMessage(message);
            const a = await db.deactivateAnnouncement(message.channel.id, name);
            if (!a) throw new Error(`Could not find announcement to disable.`);
            if (a.datePattern)
                CronDeployer.removeAnnouncement(a.id);
            const richEmbed = MsgHelper.getRichEmbed(message.author.username).setTitle(`:trumpet: :gun: ${command}`).setDescription(`Announcement **${name}** has been disabled.`);
            MsgHelper.sendMessage(message, richEmbed);
        } catch (e) {
            MsgHelper.handleError(`An error occured while disabling announcement.`, e, message);
        }
    }

    static unmarshallToggleMessage?(
        message: Message
    ): {
        enabled: boolean;
        name: string;
        command: string;
    } {
        enum Options {
            ENABLE = '-enable',
            DISABLE = '-disable',
        }
        const split = message.content.split(' ');
        const command = [split[0], split[1], split[2]].join(' ');
        const toggle = split[2];
        if (!Object.values(Options).includes(toggle as any)) throw new Error(`Please specify either -enable or -disable. See [here](https://github.com/ryanpag3/discord-tally-bot#activate-announcement) for more details.`);
        const name = split[3];
        if (!name) throw new Error(`Please specify a valid announcement name.`);
        return {
            enabled: toggle === Options.ENABLE,
            name,
            command,
        };
    }

    static runDisplayHelp(message: Message) {
        try {
            const richEmbed = MsgHelper.getRichEmbed(message.author.username)
                .setTitle(`:trumpet: !tb announce`)
                .setDescription(`Announcement commands required a subcommand. Please refer [here](https://github.com/ryanpag3/discord-tally-bot#announcements) for more information.`);
            MsgHelper.sendMessage(message, richEmbed);
        } catch (e) {
            MsgHelper.handleError(`An error occured while displaying announcement help.`, e, message);
        }
    }

    static async runGetAnnouncement(message: Message) {
        try {
            const { name, command } = AnnounceHandler.unmarshallGetMessage(message);
            const announcement = await db.getAnnouncement(message.channel.id, name);
            const richEmbed = MsgHelper.getRichEmbed(message.author.username)
                .setTitle(`:trumpet: ${command}`)
                .setDescription(`Announcement found!`)
                .addField(`Name`, announcement.name)
                .addField('Description', announcement.description || 'none');
            if (announcement.datePattern) {
                richEmbed.addField('Date', announcement.datePattern)
            } else if (announcement.tallyName) {
                richEmbed.addField('Tally Goal', `${announcement.tallyName} - ${announcement.tallyGoal}`);
            }
            MsgHelper.sendMessage(message, richEmbed);
        } catch (e) {
            MsgHelper.handleError(`There was an error while getting announcement.`, e, message)
        }
    }

    static unmarshallGetMessage(message: Message): {
        name: string,
        command: string
    } {
        const split = message.content.split(' ');
        const command = [split[0], split[1], split[2]].join(' ');
        const name = split[3];
        if (!name) throw new Error(`Valid announcement name is required.`);
        return {
            name,
            command
        }
    }

    static async checkIfMaxAnnouncementsReached(where: any) {
        if (await AnnounceHandler.isMaxAnnouncementsReached(where))
            throw new Error(`Cannot create announcement. Maximum number of announcements (${MAX_ANNOUNCEMENTS}) has been reached. This applies to each channel individually.`);
    }

    static async isMaxAnnouncementsReached(where: any) {
        const count = await db.getAnnouncementCount(where);
        if (count >= MAX_ANNOUNCEMENTS)
            return true;
        return false;
    }

    static async runGenerateAnnouncements (message: Message) {
        if (Env.isProduction()) return;
        const count = Number.parseInt(message.content.split(' ')[3]);
        const randomstring = require('randomstring');
        for (let i = 0; i < count; i++) {
            await db.createAnnouncement(message.channel.id, randomstring.generate(16), randomstring.generate(255));
        }
    }

    /**
     * !tb announce -alert [announce_name] [comma,separated,tally,names] [cron_expression]
     */
    static async runCreateAlertAnnouncement(message: Message) {
        try {
            const { command, tallyNames, datePattern, name } = this.unmarshallCreateAlertMessage(message);
            await db.createAnnouncement(message.channel.id, name, null);
            const a = await db.setAnnounceTallyAlert(message.channel.id, name, tallyNames.join(','), datePattern);
            await CronDeployer.deployAnnouncement(a);
            const richEmbed = MsgHelper.getRichEmbed(message.author.username);
            richEmbed.setTitle(`:trumpet: ${command}`)
            richEmbed.setDescription(`This announcement will display the specified tally's count on a regular schedule.`);
            richEmbed.addField(`Announcement Name`, name);
            richEmbed.addField(`Tally Name(s)`, tallyNames.join(', '))
            richEmbed.addField(`Schedule`, datePattern);
            MsgHelper.sendMessage(message, richEmbed);
        } catch (e) {
            if (e.message.toLowerCase().includes('validation error')) {
                e = new Error(`Announcement with specified name already exists.`);
            }
            MsgHelper.handleError(`An error occured while creating tally alert announcement.`, e, message);
        } 
    }

    static unmarshallCreateAlertMessage(message: Message): {
        command: string,
        name: string,
        tallyNames: string[],
        datePattern: string
    } {
        const split = message.content.split(' ');
        const command = [split[0], split[1], split[2]].join(' ');
        const name = split[3];
        if (!name) throw new Error(`Please provide a name for this announcement.`);
        const tallyNames = split[4] ? split[4].split(',') : [];
        if (tallyNames.length < 1) throw new Error(`At least one tally name must be provided to alert.`);

        const datePattern = split.slice(5, split.length).join(' ');
        return {
            command,
            name,
            tallyNames,
            datePattern
        }

    }

    static async validateTallies(tallyNames: string[], channelId: string, serverId: string) {
        for (const name of tallyNames) {
            const tally = await db.getCmdTally(channelId, serverId, false, name);
            if (!tally) throw new Error(`Could not find tally by name ${name} for current channel.`);
        }
    }
}
