import { EventEmitter } from 'events';
import Config from '../config';
import Commands from '../static/Commands';

import test from '../commands/test';
import help from '../commands/help';
import show from '../commands/show';
import create from '../commands/create';
import keyword from '../commands/keyword';
import del from '../commands/delete';
import bump from '../commands/bump';
import dump from '../commands/dump';
import empty from '../commands/empty';
import emptyAll from '../commands/empty-all';
import set from '../commands/set';
import rmall from '../commands/rmall';
import details from '../commands/details';
import describe from '../commands/describe';
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
import global from '../commands/global';
import channel from '../commands/channel';

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
            emitter.on(Config.prefix + Commands.SHOW, show);

            // create new tally
            emitter.on(Config.prefix + Commands.CREATE, create);
            emitter.on(Config.prefix + Commands.ADD, create);

            // set a tally to be global
            emitter.on(Config.prefix + Commands.GLOBAL, global);

            // set a tally to be channel-specific
            emitter.on(Config.prefix + Commands.CHANNEL, channel);

            // create a keyword tally
            emitter.on(Config.prefix + Commands.KEYWORD, keyword);
            emitter.on(Config.prefix + Commands.KW, keyword);

            // delete a tally
            emitter.on(Config.prefix + Commands.DELETE, del);
            emitter.on(Config.prefix + Commands.RM, del);

            // bump a tally's count up
            emitter.on(Config.prefix + Commands.BUMP, bump);

            // dump a tally's count down
            emitter.on(Config.prefix + Commands.DUMP, dump);

            // set a tally to 0
            emitter.on(Config.prefix + Commands.EMPTY, empty);

            // empty all tallies to 0
            emitter.on(Config.prefix + Commands.EMPTY_ALL, emptyAll);

            // set a tally to an amount
            emitter.on(Config.prefix + Commands.SET, set);

            // get tally details
            emitter.on(Config.prefix + Commands.DETAILS, details);
            emitter.on(Config.prefix + Commands.GET, details);

            // set tally description
            emitter.on(Config.prefix + Commands.DESCRIBE, describe);
            emitter.on(Config.prefix + Commands.UPDATE, describe);

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

            // set channel timezone
            // emitter.on(Config.prefix + 'timezone', timezone);

            // enable/disable patch notes alerts
            emitter.on(Config.prefix + Commands.PATCHNOTES, patchnotes);

            // show permissions
            emitter.on(Config.prefix + Commands.PERMISSIONS, permissions);

            /**
             * The following commands are only exposed when bot is run without `production` flag
             */
            if (process.env.NODE_ENV != 'production') {
                emitter.on(Config.prefix + Commands.RMALL, rmall);
            }
        } catch (e) {
            console.log('Error occured while handling command event');
            console.log(e);
        }
    }
}
