import { Message } from 'discord.js';
import CmdHelper from '../util/cmd-helper';
import DB from '../util/db';
import Counter from '../util/counter';

export default class TallyCommon {
    static db = new DB();

    /**
     * Execute a bump command
     */
    static async runBump(message: Message) {
        return await this.bumpOrDump(true, message);
    }

    /**
     * Execute a dump command
     */
    static async runDump(message: Message) {
        return await this.bumpOrDump(false, message);
    }

    /**
     * Execute either a bump or dump depending on isBump
     */
    static async bumpOrDump(isBump: boolean, message: Message) {
        let richEmbed;
        try {
            const { isGlobal, command, tallyName, amount, channelId, serverId } = this.unMarshallBumpDump(message);
            const tally = await this.db.getTally(message.channel.id, message.guild.id, isGlobal, tallyName);
            if (!tally) throw new Error(`Could not find tally named **${tallyName}**.`);
            const previous = tally.count;
            await this.updateTallyByAmount(isBump, channelId, serverId, isGlobal, tallyName, previous, amount);
            await tally.reload();
            
            console.log(`
            ${this.getBumpOrDump(isBump, 'ed')} ${tallyName}
            ------------------
            ${previous} >>> ${tally.count}
            channel ID: ${channelId}
            server ID: ${serverId}    
            user: ${message.author.tag}
            `)
            
            richEmbed = CmdHelper.getRichEmbed(message.author.username)
                .setTitle(`${isBump ? ':small_red_triangle:' : ':small_red_triangle_down:'} ${command}`)
                .setDescription(`${isGlobal ? '[G]' : '[C]'} ${tally.name} | **${previous}** >>> **${tally.count}** \n\n${this.getTallyDescription(tally)}`);
            
            if (isBump)
                await Counter.bumpTotalBumps();
            else
                await Counter.bumpTotalDumps();
        } catch (e) {
            console.log(`Error while running bumpOrDump: ` + e);
            richEmbed = CmdHelper.getRichEmbed(message.author.username)
                .setTitle(`I could not ${this.getBumpOrDump(isBump)}.`)
                .setDescription(`${e.message}`);
        }

        if (richEmbed)
            message.channel.send(richEmbed);
        CmdHelper.finalize(message);
    }

    static async updateTallyByAmount(isBump: boolean, channelId: string, 
        serverId: string, isGlobal: boolean, tallyName: string, previousAmount: number, amount: number) {
            await this.db.updateTally(
                channelId,
                serverId,
                isGlobal,
                tallyName,
                {
                    count: isBump ? previousAmount + amount : previousAmount - amount
                }
            )
    }

    static getBumpOrDump(isBump: boolean, append?: string) {
        let action = isBump ? 'bump' : 'dump';
        if (append) action += append;
        return action;
    }

    /**
     * demarshall bump/dump command into object
     */
    static unMarshallBumpDump(message: Message) {
        const split = message.content.split(' ');
        const isGlobal = CmdHelper.isGlobalTallyMessage(message);
        const command = `${split[0]} ${split[1]}`;
        if (isGlobal) split.splice(2, 1);
        const tallyName = split[2];
        if (!tallyName) throw new Error('Tally name is required.');
        const amount = split[3] ? Number.parseInt(split[3]) : 1;
        return {
            isGlobal,
            command,
            tallyName,
            amount,
            channelId: message.channel.id,
            serverId: message.guild.id
        };
    }

    static getTallyDescription(tally: any) {
        return tally.description ? CmdHelper.truncate(Buffer.from(tally.description, 'base64'), 128) : 'No description.';
    }
}
