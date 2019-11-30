import Discord, { Message } from 'discord.js';
import DBL from 'dblapi.js';
import Config from './config';
import ConfigPrivate from './config-private';
import DB from './util/db';
import CronAnnouncer from './util/cron-announcer';
import keywordUtil from './util/keyword-util';
import cmdHelper from './util/cmd-helper';
import CommandHandler from './util/command-handler.js';
import Counter from './util/counter';


const bot = new Discord.Client();
const commandHandler = new CommandHandler(bot);

let dbl;
if (process.env.NODE_ENV == 'production') // don't POST stats in dev
    dbl = new DBL(ConfigPrivate.dbots_token, bot);

const db = new DB();
db.init();

bot.on('ready', async () => {
    console.log(`Tally Bot has been started successfully in ${process.env.NODE_ENV || 'development'} mode.`);
    setTimeout(() => startBroadcasting(), 5000);
    CronAnnouncer.setBot({
        bot: bot
    });
    CronAnnouncer.initCronJobs();
    await db.initServers(bot.guilds);
    await db.normalizeTallies(bot.channels);
});

bot.on('message', async (message: Message) => {
    try {
        if (message.channel.type == 'dm') {
            return;
        }

        const startsWithPrefix = message.content.startsWith(Config.prefix);
        if (!startsWithPrefix) {
            keywordUtil.bumpKeywordTallies(message);
            return;
        }
        const isBot = message.author.bot;
        if (isBot) return;

        db.initServer(message.guild.id);
        await commandHandler.handle(message);
    } catch (e) {
        console.log(`Error while inbounding message: ` + e);
        if (e.toString().includes('invalid command')) {
            const richEmbed = {
                description: `Invalid command used.`
            };
            message.channel.send(cmdHelper.buildRichMsg(richEmbed));
        }
    }
});



/**
 * INIT
 */
bot.login(ConfigPrivate.token);

/**
 * start status broadcasting
 */
const startBroadcasting = () => {
    if (bot.user == null)
        process.exit(1);

    const statusGenerators = [
        () => {
            let users = 0;
            bot.guilds.map(guild => users += guild.members.size);
            bot.user.setActivity(`Counting things for ${bot.guilds.size} servers and ${users} users.`);
            if (dbl) dbl.postStats(bot.guilds.size);
        },
        () => {
            bot.user.setActivity(`!tb help for commands.`)
        },
        async () => {
            const tallyCnt = await db.getTallyCount();
            bot.user.setActivity(`${tallyCnt} total tallies managed.`);
        },
        async () => {
            const bumpCnt = await Counter.getBumpCount();
            bot.user.setActivity(`${bumpCnt} total bumps.`);
        },
        async () => {
            const dumpCnt = await Counter.getDumpCount();
            bot.user.setActivity(`${dumpCnt} total dumps.`);
        }
    ];

    let i = 0;
    setInterval(() => {
        if (i == statusGenerators.length) i = 0;
        statusGenerators[i]();
        i++;
    }, process.env.NODE_ENV == 'production' ? Config.status.interval : Config.status.interval_dev);
}

