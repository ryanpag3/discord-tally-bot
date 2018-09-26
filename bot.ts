import Discord, { Message } from 'discord.js';
import { EventEmitter } from 'events';
import { prefix } from './config.json';
import { token } from './config-private.json';
import db from './util/db';

const bot = new Discord.Client();
const emitter = new EventEmitter();

// init db
db.init();

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
import bump from './commands/bump';

/**
 * COMMANDS
 */
// test command functionality
emitter.on(prefix + 'test', test);
emitter.on(prefix + 't', test);

// create new tally
emitter.on(prefix + 'create', create);
emitter.on(prefix + 'add', create);

// bump a tally's count up
emitter.on(prefix + 'bump', bump);

/**
 * INIT
 */
bot.login(token);
