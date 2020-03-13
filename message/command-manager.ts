import { Message, Client } from 'discord.js';
import Permissions from '../util/permissions';
import { EventEmitter } from 'events';
import Config from '../config';
import CommandEventBuilder from './command-event-builder';
import Commands from '../static/Commands';
import logger from '../util/logger';

export default class CommandManager {
    private emitter: EventEmitter;
    private bot: Client;

    constructor(bot?: any) {
        this.emitter = new EventEmitter();
        this.bot = bot;
        CommandEventBuilder.build(this.emitter);
    }

    async setOnError() {
        this.emitter.on('error', (err) => {
            logger.info('error from emitter');
            logger.info(err);
        });
    }

    /**
     * This is the top-level entrypoint for running bot business logic.
     * @param message - discord.js message object
     */
    async handle(message: Message) {
        const mArr = message.content.split(' ');
        const hasPermission = await Permissions.hasPermission(message);
        if (!hasPermission) {
            await message.delete();
            message.author.send(
                `You do not have permission to run that command in that server. Please contact your server admin for help.`
            );
            return;
        }

        if (Permissions.isPermissionCommand(mArr)) {
            await Permissions.setPermissionRole(message);
            return;
        } else if (Permissions.isGlobalPermissionCommand(mArr)) {
            await Permissions.setAllPermissions(message);
            return;
        }

        const command = mArr[0] + ' ' + mArr[1];
        this.emit(command, message);
    }

    /**
     * Use event emitter to trigger commands
     * @param command - command to run
     * @param message - message command belongs to
     */
    emit(command: string, message: any) {
        if (this.isBotIncludedCommand(command)) {
            this.emitter.emit(command, {
                message: message,
                bot: this.bot
            });
        } else {
            this.emitter.emit(command, message);
        }
    }

    isBotIncludedCommand(command: string) {
        return command == Config.prefix + Commands.SUGGEST 
            || command == Config.prefix + Commands.BUG
            || command == Config.prefix + Commands.INVITE
    }
}
