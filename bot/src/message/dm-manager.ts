import { Message } from 'discord.js';
import { EventEmitter } from 'events';
import logger from '../util/logger';
import Config from '../util/config';
import cmdHelper from './cmd-helper';
import DmEventBuilder from './dm-event-builder';
import Commands from '../static/Commands';

export default class DmManager {
    static emitter: EventEmitter = DmManager.buildEventEmitter();
    static bot;

    static setBotClient(client) {
        DmManager.bot = client;
    }

    static buildEventEmitter(): EventEmitter {
        const e = new EventEmitter();
        DmEventBuilder.build(e);
        return e;
    }

    /**
     * This is the top level entrypoint for private messages.
     * @param message discord.js message
     */
    static async handle(message: Message) {
        if (message.author.bot) return;
        try {
            logger.info(`dm received: ${message.content}`);
            if (message.content.startsWith(Config.prefix)) {
                throw new Error(
                    `Prefix commands are not supported with direct messages. Please issue command directly without **${Config.prefix}**`
                );
            }

            if (DmManager.isGlobalMessage(message)) {
                throw new Error(`Global flags are not needed for direct messages. See here for more information: REPLACE_ME`);
            }

            DmManager.emit(message)
        } catch (e) {
            const richEmbed = cmdHelper.getRichEmbed()
                .setTitle(`:fire_extinguisher: Error`)
                .addField(`Reason`, e.message);
            message.author.send(richEmbed);
        }
    }

    static isGlobalMessage(message: Message): boolean {
        const split = message.content.split(' ');
        /**
         * we only validate against cases where prefix is not included because
         * we have already validated if it's a prefixed command
         */
        return split[1] === '-g';
    }

    static emit(message: Message) {
        const mSplit = message.content.split(' ');
        const command = mSplit[0];
        logger.debug(`emitting dm: ${command}`);
        if (command === Commands.SUGGEST || command === Commands.BUG || command === Commands.INVITE)
            DmManager.emitter.emit(command, { message, bot: this.bot });    
        else
            DmManager.emitter.emit(command, message);
    }
}
