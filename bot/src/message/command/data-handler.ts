import fs, { promises as promiseFs } from 'fs';
import axios from 'axios';
import logger from '../../util/logger';
import { Message, Attachment } from 'discord.js';
import DB from '../../util/db';
import MsgHelper from '../msg-helper';
import TallyHandler from './tally-handler';

enum SubCommands {
    IMPORT = '-import',
    EXPORT = '-export',
}

enum SupportedDataTypes {
    TALLIES = 'tallies',
    ANNOUNCEMENTS = 'announcements',
    TIMERS = 'timers',
}

/**
 * !tb data -export [datatypes]
 * !tb data -import
 */
export default class DataHandler {
    static db = new DB();

    static async run(message: Message) {
        try {
            const { subcommand } = DataHandler.unmarshallDataMsg(message);
            switch (subcommand) {
                case SubCommands.EXPORT:
                    return await DataHandler.runExport(message);
                case SubCommands.IMPORT:
                    return await DataHandler.runImport(message);
            }
        } catch (e) {
            MsgHelper.handleError(`An error occured while importing/exporting data.`, e, message);
        }
    }

    static unmarshallDataMsg(
        message: Message
    ): {
        subcommand: string;
    } {
        const split = message.content.split(' ');
        const subcommand = split[2];
        if (!Object.values(SubCommands).includes(subcommand as any)) DataHandler.raiseInvalidSubcommand();
        return {
            subcommand,
        };
    }

    static async runExport(message: Message) {
        const { command, subcommand, datatypes } = DataHandler.unmarshallExportMsg(message);
        message.channel.startTyping();
        const exportObject = await DataHandler.buildExport(message, datatypes);
        const filepath = `/tmp/tallybot_export_${new Date().getTime()}.json`;
        await promiseFs.writeFile(filepath, JSON.stringify(exportObject, null, 4), 'utf8');
        message.channel.stopTyping();
        await message.channel.send({
            files: [filepath],
        });
        await promiseFs.unlink(filepath);
    }

    static unmarshallExportMsg(
        message: Message
    ): {
        command: string;
        subcommand: string;
        datatypes?: string[];
    } {
        const split = message.content.split(' ');
        const command = `${split[0]} ${split[1]}`;
        const subcommand = split[2];
        const datatypes = split[3] ? split[3].split(',') : [];
        for (const datatype of datatypes) {
            if (!Object.values(SupportedDataTypes).includes(datatype as any))
                throw new Error(`Invalid data type detected. Supported datatypes are ${Object.values(SupportedDataTypes).join(', ')}`);
        }
        return {
            command,
            subcommand,
            datatypes,
        };
    }

    static raiseInvalidSubcommand() {
        throw new Error(`A valid subcommand is required for data management. Please provide one of the following: ${Object.values(SubCommands).join(', ')}`);
    }

    static async buildExport(message: Message, datatypes: string[]) {
        let exportObject = {};
        if (datatypes.length === 0) datatypes = Object.values(SupportedDataTypes);
        const promises = datatypes.map(async (d) => {
            return { [d]: await DataHandler.queryByDataType(message, d) };
        });
        const results = await Promise.all(promises);
        results.map((result) => {
            exportObject = { ...exportObject, ...result };
        });
        return exportObject;
    }

    static async queryByDataType(message: Message, datatype: string) {
        switch (datatype) {
            case SupportedDataTypes.TALLIES:
                return await DataHandler.queryTallies(message);
            case SupportedDataTypes.ANNOUNCEMENTS:
                return await DataHandler.queryAnnouncements(message);
            case SupportedDataTypes.TIMERS:
                return await DataHandler.queryTimers(message);
            default:
                throw new Error(`Unsupported datatype provided.`);
        }
    }

    static async queryTallies(message: Message) {
        let tallies = await this.db.getCmdTallies(message.channel.id, message.guild.id, false);
        tallies = tallies.map((t) => {
            return {
                name: t.name,
                description: t.description,
                count: t.count,
                keyword: t.keyword,
                bumpOnKeyword: t.bumpOnKeyword,
            };
        });
        return tallies;
    }

    static async queryAnnouncements(message: Message) {
        let announcements = await this.db.getAnnouncements({ channelId: message.channel.id });
        announcements = announcements.map((a) => {
            return {
                name: a.name,
                description: a.description,
                datePattern: a.datePattern,
                tallyName: a.tallyName,
                tallyGoal: a.tallyGoal,
                tallyGoalReached: a.tallyGoalReached,
            };
        });
        return announcements;
    }

    static async queryTimers(message: Message) {
        let timers = await this.db.getTimers({ channelId: message.channel.id });
        timers = timers.map (t => {
            delete t.id;
            return t;
        });
        return timers;
    }

    static async runImport(message: Message) {
        message.channel.startTyping();
        const jsonFile = message.attachments.first();
        DataHandler.validateJsonFile(jsonFile);
        const { data } = await DataHandler.downloadAttachment(jsonFile.url);
        const tallyRes = await DataHandler.importTallies(message, data.tallies);
        const announceRes = await DataHandler.importAnnouncements(message, data.announcements);
        const timerRes = await DataHandler.importTimers(message, data.timers);
        const richEmbed = MsgHelper.getRichEmbed(message.author.username)
            .setTitle(`:computer: Import Finished!`)
            .setDescription(`Here are your results`)
            .addField(`Tallies Imported`, tallyRes.count)
            .addField(`Announcements Imported`, announceRes.count)
            .addField('Timers Imported', timerRes.count);
        let filepath;
        if (tallyRes.errors || announceRes.errors || timerRes.errors) {
            filepath = `/tmp/tallybot_import_errors_${message.guild.id}_${new Date().getTime()}.txt`;
            await promiseFs.writeFile(filepath, `${tallyRes.errors || ''}\n\n${announceRes.errors || ''}\n\n${timerRes.errors || ''}`, 'utf8');
            richEmbed.addField(`Errors`, `Please see attached log for details.`);
            richEmbed.files = [filepath];
        }
        message.channel.stopTyping();
        await MsgHelper.sendMessage(message, richEmbed);
        if (filepath)
            await promiseFs.unlink(filepath);
    }

    static validateJsonFile(jsonFile: any) {
        if (!jsonFile) throw new Error(`Cannot run import without valid json data file.`);
        if (!jsonFile.filename.endsWith('.json')) throw new Error(`Only valid JSON files are allowed.`);
        if (jsonFile.filesize > 5000000)
            // bytes
            throw new Error(`File is too large for processing.`);
    }

    static async importTallies(message: Message, tallies: any[]) {
        let errors = [];
        let count = 0;
        for (const tally of tallies) {
            try {
                await DataHandler.importTally(message, tally);
                count++;
            } catch (e) {
                errors.push(e);
            }
        }
        return {
            errors: errors.length > 0 ? errors.map((e) => e.message).join('\n') : undefined,
            count
        }
    }

    static async importTally(message: Message, tally: any) {
        try {
            await TallyHandler.checkIfMaxTalliesReached({ channelId: message.channel.id, serverId: message.guild.id });
            await DataHandler.db.createCmdTally(message.channel.id, message.guild.id, false, tally.name, tally.description, tally.keyword, tally.bumpOnKeyword, tally.count);
        } catch (e) {
            if (e.message.toLowerCase().includes('validation error')) {
                logger.debug(e);
                e.message = `Tally already exists!`;
            }
            const message = `**[${tally.name}]** - ${e.message}`;
            throw new Error(message);
        }
    }

    static async importAnnouncements(message: Message, announcements: any[]) {
        let errors = [];
        let count = 0;
        for (const announcement of announcements) {
            try {
                await DataHandler.importAnnouncement(message, announcement);
                count++;
            } catch(e) {
                errors.push(e);
            }
        }
        return {
            errors: errors.length > 0 ? errors.map((e) => e.message).join('\n') : undefined,
            count
        }
    }

    static async importAnnouncement(message: Message, announcement: any) {
        try {
            const { name, description, datePattern, tallyName, tallyGoal, tallyGoalReached } = announcement;
            await DataHandler.db.createAnnouncement(message.channel.id, name, description, datePattern, tallyName, tallyGoal, tallyGoalReached);
        } catch (e) {
            if (e.message.toLowerCase().includes('validation error'))
                e.message = `Announcement already exists!`;
            const message = `**[${announcement.name}]** - ${e.message}`;
            throw new Error(message);
        }
    }

    static async importTimers(message: Message, timers: any[]) {
        let errors = [];
        let count = 0;
        for (const timer of timers) {
            try {
                await DataHandler.importTimer(message, timer);
                count++;
            } catch (e) {
                errors.push(e);
            }
        }
        return {
            errors:  errors.length > 0 ? errors.map((e) => e.message).join('\n') : undefined,
            count
        }
    }

    static async importTimer(message: Message, timer: any) {
        try {
            const { name, description, startDate, endDate, totTime } = timer;
            await DataHandler.db.createTimer(message.channel.id, name, description, startDate, endDate, totTime);
        } catch (e) {
            if (e.message.toLowerCase().includes('validation error'))
                e.message = `Timer already exists!`;
            const message = `**[${timer.name}]** - ${e.message}`;
            throw new Error(message);
        }
    }

    static async downloadAttachment(url: string) {
        return await axios.get(url);
    }
}
