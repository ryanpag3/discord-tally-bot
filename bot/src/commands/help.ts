import { Message } from "discord.js";
import helper from '../message/cmd-helper';
import logger from "../util/logger";

export default (message: Message) => {
    logger.info('Running help command for channel [' + message.channel.id + ']');
    const richEmbed = helper.getRichEmbed(message.author.username);
    richEmbed.setTitle(`:question: help`)
    richEmbed.setDescription(`Click [here](https://github.com/ryanpage42/discord-tally-bot/blob/master/README.md) for full documentation.`);
    helper.finalize(message);
    message.channel.send(richEmbed);
}