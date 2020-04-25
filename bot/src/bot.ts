import Discord, { Message, Guild, Client } from 'discord.js';
import DBL from 'dblapi.js';
import dotenv from 'dotenv';
dotenv.config();
import Config from './util/config';
import ConfigPrivate from './util/config-private';
import DB from './util/db';
import CronAnnouncer from './util/cron-announcer';
import keywordUtil from './util/keyword-util';
import cmdHelper from './message/msg-helper';
import CommandManager from './message/command-manager';
import Counter from './util/counter';
import logger from './util/logger';
import DmManager from './message/dm-manager';
import Env from './util/env';
import UserUtil from './util/user';
import HealthCheckServer from './util/healthcheck-server';

class Bot {
    static client: Client = new Discord.Client();
    static healthcheck = new HealthCheckServer(Bot.client);
    static commandManager: CommandManager = new CommandManager(Bot.client);
    static topgg = Env.isProduction() ? new DBL(ConfigPrivate.dbots_token, Bot.client) : null;
    static db: DB = new DB();
    static initialReady: boolean = true;
    
    static async start() {
        await Bot.setup();
        await Bot.client.login(ConfigPrivate.token);
        Bot.healthcheck.start();
    }

    static async setup() {
        await Bot.db.init();
        await Bot.setupEvents();
    }

    static setupEvents() {
        Bot.client.on('ready', async () => {
            try {
                logger.info(`Tally Bot has been started successfully in ${process.env.NODE_ENV || 'development'} mode.`);
                if (!Bot.initialReady) return;
                setTimeout(() => Bot.startBroadcasting(), 5000);
                CronAnnouncer.setBot({
                    bot: Bot.client
                });
                // we have to wait to init once login is complete
                await Bot.db.initServers(Bot.client.guilds);
                await Bot.db.normalizeTallies(Bot.client.channels);
                await CronAnnouncer.initCronJobs();
                Bot.initialReady = false;
            } catch (e) {
                logger.error(`An error occured while running post-launch behavior.`, e);
            }
        });
        
        Bot.client.on('message', async (message: Message) => {
            try {
                if (message.channel.type == 'dm') {
                    await UserUtil.init(message.author.id, message.author.tag);
                    return DmManager.handle(message);
                }
        
                const startsWithPrefix = message.content.startsWith(Config.prefix);
                if (!startsWithPrefix) {
                    keywordUtil.bumpKeywordTallies(message);
                    return;
                }
                const isBot = message.author.bot;
                if (isBot) return;
                await UserUtil.init(message.author.id, message.author.tag);
                await Bot.db.initServer(message.guild.id);
                await Bot.commandManager.handle(message);
            } catch (e) {
                logger.info(`Error while inbounding message: ` + e);
                if (e.toString().includes('invalid command')) {
                    const richEmbed = {
                        description: `Invalid command used.`
                    };
                    message.channel.send(cmdHelper.buildRichMsg(richEmbed));
                }
            }
        });
        
        Bot.client.on('guildCreate', async (guild: Guild) => {
            await guild.owner.send(`
            Thank you for adding Tally Bot to your server. :fist: If you did not add me, then
            someone has invited me to your server on your behalf.
        
            For help and commands https://github.com/ryanpag3/discord-tally-bot/blob/master/README.md
        
            Please take 5 seconds to upvote the bot here https://top.gg/bot/494241511714586634/vote
        
            I am always looking to improve the bot, please feel free to send feedback!
            `);
        });
        
        Bot.client.on('error', function(error) {
            logger.error(`client's WebSocket encountered a connection error`, error);
        });
        
        Bot.client.on('warn', function(info) {
            logger.info(`warn: ${info}`);
        });
        
        Bot.client.on('reconnecting', function(info) {
            logger.info(`reconnecting`);
        });

        Bot.client.on('resume', function() {
            logger.info('bot has successfully reconnected');
        })
        
        Bot.client.on('disconnect', function(event) {
            logger.info(`The WebSocket has closed and will no longer attempt to reconnect`);
            process.exit(1);
        });
    }

    static startBroadcasting() {
        if (Bot.client.user == null) process.exit(1);

        const statusGenerators = [
            () => {
                let users = 0;
                Bot.client.guilds.map(guild => (users += guild.members.size));
                Bot.client.user.setActivity(`Counting things for ${Bot.client.guilds.size} servers and ${users} users.`);
                if (Bot.topgg) Bot.topgg.postStats(Bot.client.guilds.size);
            },
            () => {
                Bot.client.user.setActivity(`!tb help for commands.`);
            },
            async () => {
                const tallyCnt = await Bot.db.getTallyCount();
                Bot.client.user.setActivity(`${tallyCnt} total tallies managed.`);
            },
            async () => {
                const bumpCnt = await Counter.getBumpCount();
                Bot.client.user.setActivity(`${bumpCnt} total bumps.`);
            },
            async () => {
                const dumpCnt = await Counter.getDumpCount();
                Bot.client.user.setActivity(`${dumpCnt} total dumps.`);
            }
        ];
    
        let i = 0;
        setInterval(
            () => {
                if (i == statusGenerators.length) i = 0;
                statusGenerators[i]();
                i++;
            },
            process.env.NODE_ENV == 'production' ? Config.status.interval : Config.status.interval_dev
        );
    }
}

Bot.start();