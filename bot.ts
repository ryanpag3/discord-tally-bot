import Discord, { Message } from 'discord.js';
import DBL from 'dblapi.js';
import { EventEmitter } from 'events';
import { prefix, status } from './config.json';
import { token, dbots_token } from './config-private.json';
import db from './util/db';
import CronAnnouncer from './util/cron-announcer';
import keywordUtil from './util/keyword-util';
import Permissions from './util/permissions';
import cmdHelper from './util/cmd-helper';
import Commands from './static/Commands';

const bot = new Discord.Client();
const emitter = new EventEmitter();
let dbl;
if (process.env.NODE_ENV == 'production') // don't POST stats in dev
    dbl = new DBL(dbots_token, bot);

db.init();

bot.on('ready', () => {
    console.log(`Tally Bot has been started successfully in ${process.env.NODE_ENV || 'development'} mode.`);
    CronAnnouncer.setBot({bot: bot });
    CronAnnouncer.initCronJobs();
    db.initServers(bot.guilds);
});

bot.on('message', async (message: Message) => {
    if (message.channel.type == 'dm') {
        return;
    }

    const startsWithPrefix = message.content.startsWith(prefix);
    if (!startsWithPrefix) {
        keywordUtil.bumpKeywordTallies(message);
        return; 
    }
    const isBot = message.author.bot;
    if (isBot) return;
    
    db.initServer(message.guild.id);

    const mArr = message.content.split(' ');
    const command = mArr[0] + ' ' + mArr[1];
    
    const hasPermission = await Permissions.hasPermission(message);
    if (!hasPermission) {
        cmdHelper.finalize(message);
        message.author.send(`You do not have permission to run that command in that server. Please contact your server admin for help.`);
        return;
    }

    if (Permissions.isPermissionCommand(mArr)) {
        Permissions.setPermissionRole(message);
        return;
    } else if (Permissions.isGlobalPermissionCommand(mArr)) {
        Permissions.setAllPermissions(message)     
        return;
    }

    emit(command, message);
});

function emit(command, message) {
    // TODO: make more data driven as more added
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
import announcements from './commands/announcements';
import timezone from './commands/timezone';
import patchnotes from './commands/patchnotes';
import permissions from './commands/permissions';

/**
 * COMMANDS
 */
// test command functionality
emitter.on(prefix + Commands.TEST, test);
emitter.on(prefix + Commands.T, test);

// give help
emitter.on(prefix + Commands.HELP, help);
emitter.on(prefix + Commands.H, help);

// show existing tallies
emitter.on(prefix + Commands.SHOW, show);

// create new tally
emitter.on(prefix + Commands.CREATE, create);
emitter.on(prefix + Commands.ADD, create);

// create a keyword tally
emitter.on(prefix + Commands.KEYWORD, keyword);
emitter.on(prefix + Commands.KW, keyword);

// delete a tally
emitter.on(prefix + Commands.DELETE, del);
emitter.on(prefix + Commands.RM, del);

// bump a tally's count up
emitter.on(prefix + Commands.BUMP, bump);

// dump a tally's count down
emitter.on(prefix + Commands.DUMP, dump)

// set a tally to 0
emitter.on(prefix + Commands.EMPTY, empty);

// set a tally to an amount
emitter.on(prefix + Commands.SET, set);

// get tally details
emitter.on(prefix + Commands.DETAILS, details);
emitter.on(prefix + Commands.GET, details);

// set tally description
emitter.on(prefix + Commands.DESCRIBE, describe);
emitter.on(prefix + Commands.UPDATE, describe);

// create a timer
emitter.on(prefix + Commands.TIMER, timer);

// start a timer
emitter.on(prefix + Commands.START, start);

// stop a timer
emitter.on(prefix + Commands.STOP, stop);

// reset a timer
emitter.on(prefix + Commands.RESET, reset);

// show all timers
emitter.on(prefix + Commands.TIMERS, timers);

// make a suggestion
emitter.on(prefix + Commands.SUGGEST, suggest);

// report a bug
emitter.on(prefix + Commands.BUG, bug);
emitter.on(prefix + Commands.REPORT, bug);

// manage announcements
emitter.on(prefix + Commands.ANNOUNCE, announce);
emitter.on(prefix + Commands.A, announce);

// show announcements
emitter.on(prefix + Commands.ANNOUNCEMENTS, announcements);

// set channel timezone
// emitter.on(prefix + 'timezone', timezone);

// enable/disable patch notes alerts
emitter.on(prefix + Commands.PATCHNOTES, patchnotes);

// show permissions
emitter.on(prefix + Commands.PERMISSIONS, permissions);

/**
 * The following commands are only exposed when bot is run without `production` flag
 */
if (process.env.NODE_ENV != 'production') {
    emitter.on(prefix + Commands.RMALL, rmall);
}
/**
 * INIT
 */
bot.login(token);

/**
 * start status broadcasting
 */
const startBroadcasting = () => {
    const statusGenerators = [
        () => {
            let users = 0;
            bot.guilds.map(guild => users += guild.members.size);
            // TODO: this is workaround, need real solution
            if (bot.user == null) 
                setTimeout(() => process.exit(1), 30000);
            else {
                bot.user.setActivity(`Counting things for ${bot.guilds.size} servers and ${users} users.`);
                if (dbl) dbl.postStats(bot.guilds.size);
            }
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