import { Message } from "discord.js";
import helper from '../util/cmd-helper';
import logger from "../util/logger";

export default (message: Message) => {
    logger.info('Running help command for channel [' + message.channel.id + ']');
    const richEmbed = helper.getRichEmbed(message.author.username);
    richEmbed.setTitle(`:question: help`)
    richEmbed.setDescription(`Click [here](https://github.com/ryanpage42/discord-tally-bot/blob/master/README.md) for full documentation.`);
    richEmbed.addField(`General Commands`, `[here](https://github.com/ryanpag3/discord-tally-bot/blob/master/README.md#General)`);
    richEmbed.addField(`Tallies`, `[here](https://github.com/ryanpag3/discord-tally-bot/blob/master/README.md#tallies)`);
    richEmbed.addField(`Announcements`, `[here](https://github.com/ryanpag3/discord-tally-bot/blob/master/README.md#announcements)`);
    richEmbed.addField(`Timers`, `[here](https://github.com/ryanpag3/discord-tally-bot/blob/master/README.md#timers)`)
    helper.finalize(message);
    message.channel.send(richEmbed);
}