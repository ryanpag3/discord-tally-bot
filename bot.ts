import Discord, { Message } from 'discord.js';
import { EventEmitter } from 'events';
import { prefix, status } from './config.json';
import { token } from './config-private.json';
import db from './util/db';
import keywordUtil from './util/keyword-util';
import AnnounceService from './util/announce-service';

const bot = new Discord.Client();
const emitter = new EventEmitter();
const announceService = new AnnounceService({bot: bot});

db.init();
announceService.start();

bot.on('ready', () => {
    console.log(`Tally Bot has been started successfully in ${process.env.NODE_ENV || 'development'} mode.`);
});

bot.on('message', (message: Message) => {
    if (message.channel.type == 'dm') {
        console.log('PM received');
        return;
    }

    const startsWithPrefix = message.content.startsWith(prefix);
    if (!startsWithPrefix) {
        keywordUtil.bumpKeywordTallies(message);
        return; 
    }

    const isBot = message.author.bot;
    if (isBot) return;
    
    const mArr = message.content.split(' ');
    const command = mArr[0] + ' ' + mArr[1];
    emit(command, message);
});

function emit(command, message) {
    // TODO: make more data driven as more added
    console.log(command);
    if (command == prefix + 'suggest' || command == prefix + 'bug') {
        emitter.emit(command, {message: message, bot: bot});
    } else {
        emitter.emit(command, message);
    }
}

/**
 * COMMAND FUNCTIONS
 */
import test from './commands/test';
import help from './commands/help';
import show from './commands/show';
import create from './commands/create';
import keyword from './commands/keyword';
import del from './commands/delete';
import bump from './commands/bump';
import dump from './commands/dump';
import empty from './commands/empty';
import set from './commands/set';
import rmall from './commands/rmall';
import details from './commands/details';
import describe from './commands/describe';
import timer from './commands/timer';
import start from './commands/start';
import stop from './commands/stop';
import reset from './commands/reset';
import timers from './commands/timers';
import suggest from './commands/suggest';
import bug from './commands/bug';
import announce from './commands/announce';
import timezone from './commands/timezone';

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

// create a keyword tally
emitter.on(prefix + 'keyword', keyword);
emitter.on(prefix + 'kw', keyword);

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

// create a timer
emitter.on(prefix + 'timer', timer);

// start a timer
emitter.on(prefix + 'start', start);

// stop a timer
emitter.on(prefix + 'stop', stop);

// reset a timer
emitter.on(prefix + 'reset', reset);

// show all timers
emitter.on(prefix + 'timers', timers);

// make a suggestion
emitter.on(prefix + 'suggest', suggest);

// report a bug
emitter.on(prefix + 'bug', bug);
emitter.on(prefix + 'report', bug);

// manage announcements
emitter.on(prefix + 'announce', announce);
emitter.on(prefix + 'a', announce);

// set channel timezone
emitter.on(prefix + 'timezone', timezone);

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

/**
 * start status broadcasting
 */
const startBroadcasting = () => {
    /**
     *  
     */
    const statusGenerators = [
        () => {
            let users = 0;
            bot.guilds.map(guild => users += guild.members.size);
            bot.user.setActivity(`Counting things for ${bot.guilds.size} servers and ${users} users.`);
        },
        () => {
            bot.user.setActivity(`!tb help for commands.`)
        },
        async () => {
            const tallyCnt = await db.getTallyCount();
            bot.user.setActivity(`${tallyCnt} total tallies managed.`);
        },
        async () => {
            const bumpCnt = await db.getBumpCount();
            bot.user.setActivity(`${bumpCnt} total bumps.`);
        },
        async () => {
            const dumpCnt = await db.getDumpCount();
            bot.user.setActivity(`${dumpCnt} total dumps.`);
        }
    ];

    let i = 0;
    setInterval(() => {
        if (i == statusGenerators.length) i = 0;
        statusGenerators[i]();
        i++;
    }, process.env.NODE_ENV == 'production' ? status.interval : status.interval_dev);    
}

startBroadcasting();