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
        return await TallyHandler.runBump(message, IS_DM_MESSAGE);
    }

    static async runDump(message: Message) {
        return await TallyHandler.runDump(message, IS_DM_MESSAGE);
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