import { Message } from 'discord.js';
import CmdHelper from '../util/cmd-helper';
import DB from '../util/db';
import Counter from '../util/counter';

export default class TallyHandler {
    static db = new DB();

    /**
     * Execute a bump command
     */
    static async runBump(message: Message) {
        return await TallyHandler.bumpOrDump(true, message);
    }

    /**
     * Execute a dump command
     */
    static async runDump(message: Message) {
        return await TallyHandler.bumpOrDump(false, message);
    }

    /**
     * Execute either a bump or dump depending on isBump
     */
    static async bumpOrDump(isBump: boolean, message: Message) {
        let richEmbed;
        try {
            const { isGlobal, command, tallyName, amount, channelId, serverId } = TallyHandler.unMarshall(message);
            const tally = await TallyHandler.db.getTally(message.channel.id, message.guild.id, isGlobal, tallyName);
            if (!tally) throw new Error(`Could not find tally named **${tallyName}**.`);
            const previous = tally.count;
            await TallyHandler.updateTallyByAmount(isBump, channelId, serverId, isGlobal, tallyName, previous, amount);
            await tally.reload();

            console.log(`
            ${TallyHandler.getBumpOrDump(isBump, 'ed')} ${tallyName}
            ------------------
            ${previous} >>> ${tally.count}
            channel ID: ${channelId}
            server ID: ${serverId}    
            user: ${message.author.tag}
            `);

            richEmbed = CmdHelper.getRichEmbed(message.author.username)
                .setTitle(`${isBump ? ':small_red_triangle:' : ':small_red_triangle_down:'} ${command}`)
                .setDescription(
                    `${isGlobal ? '[G]' : '[C]'} ${tally.name} | **${previous}** >>> **${
                        tally.count
                    }** \n\n${TallyHandler.getTallyDescription(tally)}`
                );

            if (isBump) await Counter.bumpTotalBumps();
            else await Counter.bumpTotalDumps();
        } catch (e) {
            console.log(`Error while running bumpOrDump: ` + e);
            richEmbed = CmdHelper.getRichEmbed(message.author.username)
                .setTitle(`I could not ${TallyHandler.getBumpOrDump(isBump)}.`)
                .setDescription(`${e.message}`);
        }

        if (richEmbed) message.channel.send(richEmbed);
        CmdHelper.finalize(message);
    }

    static async updateTallyByAmount(
        isBump: boolean,
        channelId: string,
        serverId: string,
        isGlobal: boolean,
        tallyName: string,
        previousAmount: number,
        amount: number
    ) {
        await TallyHandler.db.updateTally(channelId, serverId, isGlobal, tallyName, {
            count: isBump ? previousAmount + amount : previousAmount - amount
        });
    }

    static getBumpOrDump(isBump: boolean, append?: string) {
        let action = isBump ? 'bump' : 'dump';
        if (append) action += append;
        return action;
    }

    static getIsGlobalIcon(isGlobal: boolean) {
        return `[${isGlobal ? 'G' : 'C'}]`;
    }

    /**
     * demarshall bump/dump command into object
     */
    static unMarshall(message: Message, amountRequired: boolean = false) {
        const split = message.content.split(' ');
        const isGlobal = CmdHelper.isGlobalTallyMessage(message);
        const command = `${split[0]} ${split[1]}`;
        if (isGlobal) split.splice(2, 1);
        const tallyName = split[2];
        if (!tallyName) throw new Error('Tally name is required.');
        const amount = split[3] ? Number.parseInt(split[3]) : 1;
        if (amountRequired === true && !split[3]) throw new Error(`Amount is required.`);
        return {
            isGlobal,
            command,
            tallyName,
            amount,
            channelId: message.channel.id,
            serverId: message.guild.id,
            description: split[3] ? split[3] : 'No description.'
        };
    }

    static getTallyDescription(tally: any) {
        return tally.description ? CmdHelper.truncate(Buffer.from(tally.description, 'base64'), 128) : 'No description.';
    }

    static async runSet(message: Message) {
        let richEmbed;
        const { isGlobal, command, tallyName, amount, channelId, serverId } = TallyHandler.unMarshall(message, true);
        try {
            const tally = await TallyHandler.db.getTally(channelId, serverId, isGlobal, tallyName);
            if (!tally) throw new Error(`Could not find tally with name **${tallyName}**.`);
            const description = tally.description;
            tally.count = amount;
            await TallyHandler.db.saveTally(tally);
            console.log(`
                ${tallyName} has been set.
                ------------
                previous: ${tally.count}
                new: ${amount}
                `);

            richEmbed = CmdHelper.getRichEmbed(message.author.username)
                .setTitle(`:small_blue_diamond: ${command}`)
                .setDescription(`${isGlobal ? '[G]' : '[C]'} **${tallyName}** has been set to ${amount}.\n\n${description}`);
        } catch (e) {
            console.log(e);
            richEmbed = CmdHelper.getRichEmbed(message.author.username)
                .setTitle(`:small_blue_diamond: ${command}`)
                .setDescription(`I could not set **${tallyName}**. Reason: ${e}`);
        }
        if (richEmbed) message.channel.send(richEmbed);
        CmdHelper.finalize(message);
    }

    static async runEmpty(message: Message) {
        let richEmbed;
        const { isGlobal, command, tallyName, channelId, serverId } = TallyHandler.unMarshall(message);
        try {
            const tally = await TallyHandler.db.getTally(channelId, serverId, isGlobal, tallyName);
            if (!tally) throw new Error(`Could not find tally with name **${tallyName}**.`);
            const description = tally.description;
            tally.count = 0;
            await TallyHandler.db.saveTally(tally);
            console.log(`
            ${tallyName} has been emptied.
            ------------
            previous: ${tally.count}
            new: 0
            `);
            richEmbed = CmdHelper.getRichEmbed(message.author.username)
                .setTitle(`:recycle: ${command}`)
                .setDescription(`${isGlobal ? '[G]' : '[C]'} **${tallyName}** has been set to 0.\n\n${description}`);
        } catch (e) {
            console.log(e);
            richEmbed = CmdHelper.getRichEmbed(message.author.username)
                .setTitle(`:recycle: ${command}`)
                .setDescription(`I could not empty **${tallyName}**. Reason: ${e}`);
        }
        if (richEmbed) message.channel.send(richEmbed);
        CmdHelper.finalize(message);
    }

    static async runCreate(message: Message) {
        const { 
            isGlobal, 
            command, 
            tallyName, 
            channelId, 
            serverId, 
            description 
        } = TallyHandler.unMarshall(message);
        let richEmbed;
        try {
            await TallyHandler.db.createTally(
                channelId,
                serverId,
                isGlobal,
                tallyName,
                description
            );
            
            console.log(`
            Tally Created 
            -------------
            name: ${tallyName}
            channel ID: ${channelId}
            server ID: ${serverId}    
            user: ${message.author.tag}
            `);
            richEmbed = CmdHelper.getRichEmbed(message.author.username)
                .setTitle(`:bar_chart: ${command}`)
                .setDescription(`**name:** ${TallyHandler.getIsGlobalIcon(isGlobal)} ${tallyName}\n\n**description:** ${description}\n\nfor commands: [click here](https://github.com/ryanpag3/discord-tally-bot/blob/master/README.md)`);
        } catch (e) {
            if (e.toString().toLowerCase().includes('validation error'))
                e = `Tally already exists.`;
            console.log(e);
            richEmbed = CmdHelper.getRichEmbed(message.author.username)
                .setTitle(`:bar_chart: ${command}`)
                .setDescription(`I could not create **${tallyName}**. Reason: ${e}`);
        }
        if (richEmbed) message.channel.send(richEmbed);
        CmdHelper.finalize(message);
    }

    static async runDelete(message: Message) {
        const { isGlobal, command, tallyName, channelId, serverId } = TallyHandler.unMarshall(message);
        let richEmbed;
        try {
            await TallyHandler.db.deleteTally(channelId, serverId, isGlobal, tallyName);
            richEmbed = CmdHelper.getRichEmbed(message.author.username)
                .setTitle(`:wastebasket: ${command}`)
                .setDescription(`${TallyHandler.getIsGlobalIcon(isGlobal)} **${tallyName}** has been destroyed.`);
        } catch (e) {
            console.log(e);
            richEmbed = CmdHelper.getRichEmbed(message.author.username)
                .setTitle(`:wastebasket: ${command}`)
                .setDescription(`I could not delete **${tallyName}**. Reason: ${e.message}`);
        }
        if (richEmbed) message.channel.send(richEmbed);
        CmdHelper.finalize(message);
    }

    static async runDescribe(message: Message) {
        let richEmbed;
        const { isGlobal, command, tallyName, channelId, serverId, description } = TallyHandler.unMarshall(message);
        try {
            const tally = await TallyHandler.db.getTally(channelId, serverId, isGlobal, tallyName);
            if (!tally) throw new Error(`Could not find tally with name **${tallyName}**.`);
            await TallyHandler.db.setTallyDescription(channelId, serverId, isGlobal, tallyName, description);
            richEmbed = CmdHelper.getRichEmbed(message.author.username)
                .setTitle(`:pencil2: ${command}`)
                .setDescription(`${TallyHandler.getIsGlobalIcon(isGlobal)} **${tallyName}'s** description is now\n\n${description}`);
        } catch (e) {
            console.log(e);
            richEmbed = CmdHelper.getRichEmbed(message.author.username)
                .setTitle(`:pencil2: ${command}`)
                .setDescription(`I could not describe **${tallyName}**. Reason: ${e.message}`);
        }
        if (richEmbed) message.channel.send(richEmbed);
        CmdHelper.finalize(message);
    }
}
