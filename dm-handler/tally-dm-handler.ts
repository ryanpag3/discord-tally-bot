import { Message } from "discord.js";
import CmdHelper from '../util/cmd-helper';
import Config from "../config";
import logger from "../util/logger";
import DB from "../util/db";

export default class TallyDmHandler {
    static db = new DB();

    static async runCreate(message: Message) {
        const { command, tallyName, description } = TallyDmHandler.unMarshall(message);
        logger.debug(`creating tally for user ${message.author.id} with name ${tallyName}`);
        let richEmbed;
        try {
            const tally = await TallyDmHandler.db.createDmTally(message.author.id, tallyName, description);
            richEmbed = CmdHelper.getRichEmbed(message.author.username)
                .setTitle(`:bar_chart: ${command}`)
                .setDescription(`**name:** ${tally.name}\n\n**description:** ${Buffer.from(tally.description, 'base64')}\n\nfor commands: [click here](https://github.com/ryanpag3/discord-tally-bot/blob/master/README.md)`);
        } catch (e) {
            if (e.toString().toLowerCase().includes('validation error'))
                e = `Tally already exists.`;
                logger.error(e);
            richEmbed = CmdHelper.getRichEmbed(message.author.username)
                .setTitle(`:bar_chart: ${command}`)
                .setDescription(`I could not create **${tallyName}**. Reason: ${e}`);
        }
        message.channel.send(richEmbed);
        // TODO: finalize?
    }

    static unMarshall(message: Message, amountRequired: boolean = false, tallyNameRequired: boolean = true) {
        const split = message.content.split(' ');
        const command = split[0];
        if (!command) throw new Error(`Command required.`);
        const tallyName = split[1];
        if (tallyNameRequired && !tallyName) throw new Error(`Tally name required.`);
        const amount = split[3] ? split[3] : Number.parseInt(split[3]);
        if (amountRequired && !split[3]) throw new Error(`Ammount required.`);
        const description = split[3];
        return { command, tallyName, amount, description };
    }
}