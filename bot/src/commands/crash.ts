import { Message } from "discord.js";
import helper from '../message/cmd-helper';
import Env from "../util/env";
import logger from "../util/logger";

export default async (message: Message) => {

    if (Env.isProduction()) {
        logger.info(`Someone tried to run !tb crash in production and they got rekt.`);
        return;
    }

    logger.info('Crashing the bot...');

    return new Promise((resolve, reject) => {
        return reject(new Error(`Error that shuts the whole damn thing down!`));
    })
}