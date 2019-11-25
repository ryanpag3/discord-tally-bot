import { EventEmitter } from 'events';
import { prefix, status } from '../config.json';
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
import timezone from '../commands/timezone';
import patchnotes from '../commands/patchnotes';
import permissions from '../commands/permissions';
import global from '../commands/global';
import channel from '../commands/channel';

export default class CommandEventBuilder {
    static build(emitter: EventEmitter) {
        try {
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

            // set a tally to be global
            emitter.on(prefix + Commands.GLOBAL, global);

            // set a tally to be channel-specific
            emitter.on(prefix + Commands.CHANNEL, channel);

            // create a keyword tally
            emitter.on(prefix + Commands.KEYWORD, keyword);
            emitter.on(prefix + Commands.KW, keyword);

            // delete a tally
            emitter.on(prefix + Commands.DELETE, del);
            emitter.on(prefix + Commands.RM, del);

            // bump a tally's count up
            emitter.on(prefix + Commands.BUMP, bump);

            // dump a tally's count down
            emitter.on(prefix + Commands.DUMP, dump);

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
        } catch (e) {
            console.log('Error occured while handling command event');
            console.log(e);
        }
    }
}
