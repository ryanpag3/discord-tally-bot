import { Message } from "discord.js";
import Config from "../config";
import logger from "../util/logger";

export default class TallyDmHandler {
    static async runCreate(message: Message) {
        logger.info('wassup');
        const {} = TallyDmHandler.unMarshall(message);
    }

    static async unMarshall(message: Message, amountRequired: boolean = false, tallyNameRequired: boolean = true) {
        // const split = message.content.split(' ');

    }
}