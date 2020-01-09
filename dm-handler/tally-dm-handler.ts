import { Message } from "discord.js";
import CmdHelper from '../util/cmd-helper';
import Config from "../config";
import logger from "../util/logger";
import DB from "../util/db";
import TallyHandler from "../command-handlers/tally-handler";

const IS_DM_MESSAGE = true;

export default class TallyDmHandler {
    static db = new DB();

    static async runCreate(message: Message) {
        return await TallyHandler.runCreate(message, IS_DM_MESSAGE);
    }

    static async runDelete(message: Message) {
        return await TallyHandler.runDelete(message, IS_DM_MESSAGE);
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