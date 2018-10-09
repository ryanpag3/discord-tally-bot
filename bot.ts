import Discord, { Message } from 'discord.js';
import { EventEmitter } from 'events';
import { prefix } from './config.json';
import { token } from './config-private.json';
import db from './util/db';

const bot = new Discord.Client();
const emitter = new EventEmitter();

db.init();

function getCommand(message: Message) {
    const mArr = message.content.split(' ');
    return mArr[0] + ' ' + mArr[1];
}

bot.on('ready', () => {
    console.log(`Bot has been started successfully in ${process.env.NODE_ENV || 'development'} mode.`);
    setInterval(() => {
        let userCount = 0;
        bot.guilds.map((guild) => {
            userCount += guild.members.size
        });
        bot.user.setActivity(`Counting things for ${bot.guilds.size} servers and ${userCount} users.`);
    }, 5000);
});

bot.on('message', (message: Message) => {

    if (message.channel.type == 'dm')
        console.log('PM received');

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
import help from './commands/help';
import show from './commands/show';
import create from './commands/create';
import del from './commands/delete';
import bump from './commands/bump';
import dump from './commands/dump';
import empty from './commands/empty';
import set from './commands/set';
import rmall from './commands/rmall';
import details from './commands/details';
import describe from './commands/describe';

/**
 * COMMANDS
 */
// test command functionality
emitter.on(prefix + 'test', test);
emitter.on(prefix + 't', test);

// give help
emitter.on(prefix + 'help', help);
emitter.on(prefix + 'h', help);

// show existing tallies
emitter.on(prefix + 'show', show);

// create new tally
emitter.on(prefix + 'create', create);
emitter.on(prefix + 'add', create);

// delete a tally
emitter.on(prefix + 'delete', del);
emitter.on(prefix + 'rm', del);

// bump a tally's count up
emitter.on(prefix + 'bump', bump);

// dump a tally's count down
emitter.on(prefix + 'dump', dump)

// set a tally to 0
emitter.on(prefix + 'empty', empty);

// set a tally to an amount
emitter.on(prefix + 'set', set);

// get tally details
emitter.on(prefix + 'details', details);
emitter.on(prefix + 'get', details);

// set tally description
emitter.on(prefix + 'describe', describe);
emitter.on(prefix + 'update', describe);


/**
 * The following commands are only exposed when bot is run without `production` flag
 */
if (process.env.NODE_ENV != 'production') {
    emitter.on(prefix + 'rmall', rmall);
}
/**
 * INIT
 */
bot.login(token);
