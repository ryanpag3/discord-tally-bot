import { Message } from "discord.js";
import CmdHelper from '../msg-helper';
import Config from "../../util/config";
import logger from "../../util/logger";
import DB from "../../util/db";
import TallyHandler from "../command/tally-handler";
import MsgHelper from "../msg-helper";
import { getEmoji } from "../../static/MsgEmojis";
import Counter from "../../util/counter";

const IS_DM_MESSAGE = true;

export default class TallyDmHandler {
    static db = new DB();

    static async runCreate(message: Message) {
        return await TallyHandler.runCreate(message, IS_DM_MESSAGE);
    }

    static async runDelete(message: Message) {
        return await TallyHandler.runDelete(message, IS_DM_MESSAGE);
    }

    static async runDeleteAll(message: Message) {
        return await TallyHandler.deleteAll(message, IS_DM_MESSAGE);
    }

    static async runDescribe(message: Message) {
        return await TallyHandler.runDescribe(message, IS_DM_MESSAGE);
    }

    static async runShow(message: Message) {
        return await TallyHandler.runShow(message, IS_DM_MESSAGE);
    }

    static async runGet(message: Message) {
        return await TallyHandler.runDetails(message, IS_DM_MESSAGE);
    }

    static async runBump(message: Message) {
        try {
            const amountRequired = false, tallyNameRequired = true;
            const { tallyName, command, amount } = TallyDmHandler.unMarshall(message, amountRequired, tallyNameRequired);
            const richEmbed = MsgHelper.getRichEmbed(message.author.username)
                .setTitle(`${getEmoji(command)} ${command}`);
            const tally = await TallyDmHandler.db.getDmTally(message.author.id, tallyName);
            if (!tally) throw new Error(`Could not find DM tally with name ${tallyName}.`);
            const previousCount = tally.count;
            const update = {
                count: previousCount + amount
            };
            await TallyDmHandler.db.updateDmTally(message.author.id, tallyName, update);
            await tally.reload();
            logger.info(`bumped ${tallyName} by ${amount} for user ${message.author.id}`);
            richEmbed.setDescription(`**${tallyName}** has been updated from **${previousCount}** to **${update.count}**.

            for info run \`get ${tallyName}\`
            `);
            MsgHelper.sendMessage(message, richEmbed);
            Counter.bumpTotalBumps();
        } catch (e) {
            MsgHelper.handleError(`Error while bumping DM tally.`, e, message);
        }
    }

    static async runDump(message: Message) {
        try {
            const amountRequired = false, tallyNameRequired = true;
            const { tallyName, command, amount } = TallyDmHandler.unMarshall(message, amountRequired, tallyNameRequired);
            const richEmbed = MsgHelper.getRichEmbed(message.author.username)
                .setTitle(`${getEmoji(command)} ${command}`);
            const tally = await TallyDmHandler.db.getDmTally(message.author.id, tallyName);
            if (!tally) throw new Error(`Could not find DM tally with name **${tallyName}**`);
            const previousCount = tally.count;
            const update = {
                count: previousCount - amount
            };
            await TallyDmHandler.db.updateDmTally(message.author.id, tallyName, update);
            await tally.reload();
            logger.info(`dumped DM tally ${tallyName} by ${amount} for user ${message.author.id}`);
            richEmbed.setDescription(`**${tallyName}** has been updated from **${previousCount}** to **${update.count}**.

            for info run \`get ${tallyName}\``);
            MsgHelper.sendMessage(message, richEmbed);
            Counter.bumpTotalDumps();
        } catch (e) {
            MsgHelper.handleError(`Error while dumping DM tally.`, e, message);
        }
    }

    static async runSet(message: Message) {
        return await TallyHandler.runSet(message, IS_DM_MESSAGE);
    }

    static async runEmpty(message: Message) {
        return await TallyHandler.runEmpty(message, IS_DM_MESSAGE);
    }

    static async runEmptyAll(message: Message) {
        return await TallyHandler.runEmptyAll(message, IS_DM_MESSAGE);
    }

    static async runGenerate(message: Message) {
        return await TallyHandler.runGenerate(message, IS_DM_MESSAGE);
    }

    static unMarshall(message: Message, amountRequired: boolean = false, tallyNameRequired: boolean = true) {
        const split = message.content.split(' ');
        const command = split[0];
        if (!command) throw new Error(`Command required.`);
        const tallyName = split[1];
        if (tallyNameRequired && !tallyName) throw new Error(`Tally name required.`);
        const amount = split[2] ? Number.parseInt(split[2]) : 1;
        if (amountRequired && !split[2]) throw new Error(`Ammount required.`);
        const description = split.slice(2, split.length).join(' ');
        return { command, tallyName, amount, description };
    }
}