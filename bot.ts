import Discord, { Message } from 'discord.js';
import { EventEmitter } from 'events';
import { prefix } from './config.json';
import { token } from './config-private.json';

const bot = new Discord.Client();
const emitter = new EventEmitter();

// TODO: fix implementation
function getCommand(message: Message) {
    const mArr = message.content.split(' ');
    return mArr[0] + ' ' + mArr[1];
}

bot.on('ready', () => {
    console.log('Bot has been started successfully!');
});

bot.on('message', (message: Message) => {
    const isBot = message.author.bot;
    if (isBot) return;

    const startsWithPrefix = message.content.indexOf(prefix)
    if (startsWithPrefix) return;

    const command = getCommand(message);
    emitter.emit(command, message);
});

/**
 * COMMAND FUNCTIONS
 */
import test from './commands/test';
import create from './commands/create';

/**
 * COMMANDS
 */
// test command functionality
emitter.on(prefix + 'test', test);
emitter.on(prefix + 't', test);

// create new tally
emitter.on(prefix + 'create', create);

/**
 * INIT
 */
bot.login(token);
