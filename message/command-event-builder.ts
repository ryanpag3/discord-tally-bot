import { EventEmitter } from 'events';
import Config from '../config';
import Commands from '../static/Commands';

import test from '../commands/test';
import help from '../commands/help';
import keyword from '../commands/keyword';
import rmall from '../commands/rmall';
import timer from '../commands/timer';
import start from '../commands/start';
import stop from '../commands/stop';
import reset from '../commands/reset';
import timers from '../commands/timers';
import suggest from '../commands/suggest';
import bug from '../commands/bug';
import announce from '../commands/announce';
import announcements from '../commands/announcements';
import patchnotes from '../commands/patchnotes';
import permissions from '../commands/permissions';
import crash from '../commands/crash';
import Env from '../util/env';
import TallyHandler from './command/tally-handler';
import CmdHandler from './command/cmd-handler';
import logger from '../util/logger';

export default class CommandEventBuilder {
    static build(emitter: EventEmitter) {
        try {
            // test command functionality
            emitter.on(Config.prefix + Commands.TEST, test);
            emitter.on(Config.prefix + Commands.T, test);

            // give help
            emitter.on(Config.prefix + Commands.HELP, help);
            emitter.on(Config.prefix + Commands.H, help);

            // show existing tallies
            emitter.on(Config.prefix + Commands.SHOW, TallyHandler.runShow);

            // create new tally
            emitter.on(Config.prefix + Commands.CREATE, TallyHandler.runCreate);
            emitter.on(Config.prefix + Commands.ADD, TallyHandler.runCreate);

            // set a tally to be global
            emitter.on(Config.prefix + Commands.GLOBAL, TallyHandler.runGlobal);

            // set a tally to be channel-specific
            emitter.on(Config.prefix + Commands.CHANNEL, TallyHandler.runChannel);

            // create a keyword tally
            emitter.on(Config.prefix + Commands.KEYWORD, keyword);
            emitter.on(Config.prefix + Commands.KW, keyword);

            // delete a tally
            emitter.on(Config.prefix + Commands.DELETE, TallyHandler.runDelete);
            emitter.on(Config.prefix + Commands.RM, TallyHandler.runDelete);

            // bump a tally's count up
            emitter.on(Config.prefix + Commands.BUMP, TallyHandler.runBump);

            // dump a tally's count down
            emitter.on(Config.prefix + Commands.DUMP, TallyHandler.runDump);

            // set a tally to 0
            emitter.on(Config.prefix + Commands.EMPTY, TallyHandler.runEmpty);

            // empty all tallies to 0
            emitter.on(Config.prefix + Commands.EMPTY_ALL, TallyHandler.runEmptyAll);

            // delete all tallies
            emitter.on(Config.prefix + Commands.DELETE_ALL, TallyHandler.deleteAll);

            // set a tally to an amount
            emitter.on(Config.prefix + Commands.SET, TallyHandler.runSet);

            // get tally details
            emitter.on(Config.prefix + Commands.DETAILS, TallyHandler.runDetails);
            emitter.on(Config.prefix + Commands.GET, TallyHandler.runDetails);

            // set tally description
            emitter.on(Config.prefix + Commands.DESCRIBE, TallyHandler.runDescribe);
            emitter.on(Config.prefix + Commands.UPDATE, TallyHandler.runDescribe);

            // create a timer
            emitter.on(Config.prefix + Commands.TIMER, timer);

            // start a timer
            emitter.on(Config.prefix + Commands.START, start);

            // stop a timer
            emitter.on(Config.prefix + Commands.STOP, stop);

            // reset a timer
            emitter.on(Config.prefix + Commands.RESET, reset);

            // show all timers
            emitter.on(Config.prefix + Commands.TIMERS, timers);

            // make a suggestion
            emitter.on(Config.prefix + Commands.SUGGEST, suggest);

            // report a bug
            emitter.on(Config.prefix + Commands.BUG, bug);
            emitter.on(Config.prefix + Commands.REPORT, bug);

            // manage announcements
            emitter.on(Config.prefix + Commands.ANNOUNCE, announce);
            emitter.on(Config.prefix + Commands.A, announce);

            // show announcements
            emitter.on(Config.prefix + Commands.ANNOUNCEMENTS, announcements);

            // enable/disable patch notes alerts
            emitter.on(Config.prefix + Commands.PATCHNOTES, patchnotes);

            // show permissions
            emitter.on(Config.prefix + Commands.PERMISSIONS, permissions);

            // get invite link
            emitter.on(Config.prefix + Commands.INVITE, CmdHandler.runInvite);

            /**
             * The following commands are only exposed when bot is run without `production` flag
             */
            if (Env.isProduction() === false) {
                emitter.on(Config.prefix + Commands.RMALL, rmall);
                emitter.on(Config.prefix + Commands.CRASH, crash);
                emitter.on(Config.prefix + Commands.GENERATE, TallyHandler.runGenerate);
            }
        } catch (e) {
            logger.info('Error occured while handling command event');
            logger.info(e);
        }
    }
}