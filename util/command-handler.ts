import { Message, Client } from 'discord.js';
import Permissions from './permissions';
import { EventEmitter } from 'events';
import { prefix, status } from '../config.json';
import CommandEventBuilder from './command-event-builder';

export default class CommandHandler {
    private emitter: EventEmitter;
    private bot: Client;

    constructor(emitter: EventEmitter, bot: Client) {
        this.emitter = emitter;
        this.bot = bot;
        CommandEventBuilder.build(emitter);
    }

    /**
     * This is the top-level entrypoint for running bot business logic.
     * @param message - discord.js message object
     */
    async handle(message: Message) {
        const mArr = message.content.split(' ');
        const command = mArr[0] + ' ' + mArr[1];

        const hasPermission = await Permissions.hasPermission(message);
        if (!hasPermission) {
            await message.delete();
            message.author.send(
                `You do not have permission to run that command in that server. Please contact your server admin for help.`
            );
            return;
        }

        if (Permissions.isPermissionCommand(mArr)) {
            Permissions.setPermissionRole(message);
            return;
        } else if (Permissions.isGlobalPermissionCommand(mArr)) {
            Permissions.setAllPermissions(message);
            return;
        }

        this.emit(command, message);
    }

    /**
     * Use event emitter to trigger commands
     * @param command - command to run
     * @param message - message command belongs to
     */
    private emit(command: string, message: Message) {
        // TODO: make more data driven as more added
        if (command == prefix + 'suggest' || command == prefix + 'bug') {
            this.emitter.emit(command, {
                message: message,
                bot: this.bot
            });
        } else {
            this.emitter.emit(command, message);
        }
    }
}
