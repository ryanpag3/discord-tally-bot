import { Message } from "discord.js";
import helper from '../util/cmd-helper';
import logger from "../util/logger";

export default (message: Message) => {
    logger.info('Running test command for channel [' + message.channel.id + ']');

    helper.finalize(message);

    message.channel.send('This is a test command. Major tom to ground control?');
}