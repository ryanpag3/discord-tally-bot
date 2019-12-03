import { Message } from 'discord.js';
import cmdHelper from '../util/cmd-helper';
import DB from '../util/db';

export default class TallyCommon {
    static db = new DB();

    /**
     * Execute a bump command
     */
    static async runBump(message: Message) {
        // log
        return await this.bumpOrDump(true, message);
    }

    /**
     * Execute a dump command
     */
    static async runDump(message: Message) {
        // log
        return await this.bumpOrDump(false, message);
    }

    /**
     * Execute either a bump or dump depending on isBump
     */
    static async bumpOrDump(isBump: boolean, message: Message) {
        try {
            const channelId = message.channel.id;
            const serverId = message.guild.id;
            const { isGlobal, command, tallyName, amount } = this.unMarshallBumpDump(message);
            console.log(`${this.getBumpOrDump(isBump, 'ing')} ${tallyName} by ${amount}`);
            const tally = await this.db.getTally(message.channel.id, message.guild.id, isGlobal, tallyName);
            if (!tally) throw new Error(`Could not find tally to ${this.getBumpOrDump(isBump)}`);
            const previous = tally.count;
            await this.updateTallyByAmount(channelId, serverId, isGlobal, tallyName, previous, amount);
            await tally.reload();
            console.log(`
            ${this.getBumpOrDump(isBump, 'ed')} ${tallyName}
            ------------------
            ${previous} >>> ${tally.count}
            `)
        } catch (e) {
            // top-level catch and response
        }
    }

    static async updateTallyByAmount(channelId: string, 
        serverId: string, isGlobal: boolean, tallyName: string, previousAmount: number, amount: number) {
            await this.db.updateTally(
                channelId,
                serverId,
                isGlobal,
                tallyName,
                {
                    count: previousAmount + amount
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
        const isGlobal = cmdHelper.isGlobalTallyMessage(message);
        const command = `${split[0]} ${split[1]}`;
        if (isGlobal) split.splice(2, 1);
        const tallyName = split[2];
        if (!tallyName) throw new Error('Tally name is required.');
        const amount = split[3] ? Number.parseInt(split[3]) : 1;
        return {
            isGlobal,
            command,
            tallyName,
            amount
        };
    }
}
