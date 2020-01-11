import { EventEmitter } from 'events';
import Commands from '../static/Commands';
import TallyDmHandler from '../dm-handler/tally-dm-handler';
import Env from './env';
import bug from '../commands/bug';
import suggest from '../commands/suggest';
import help from '../commands/help';
import test from '../commands/test';
import CmdHandler from '../command-handlers/cmd-handler';

/**
 * Build DM events separate until we have reached feature equality
 */
export default class DmEventBuilder {
    static build(emitter: EventEmitter) {
        // create a tally
        emitter.on(Commands.CREATE, TallyDmHandler.runCreate);
        emitter.on(Commands.ADD, TallyDmHandler.runCreate);

        // delete a tally
        emitter.on(Commands.DELETE, TallyDmHandler.runDelete);
        emitter.on(Commands.RM, TallyDmHandler.runDelete);

        // delete all tallies
        emitter.on(Commands.DELETE_ALL, TallyDmHandler.runDeleteAll);

        // set tally description
        emitter.on(Commands.DESCRIBE, TallyDmHandler.runDescribe);
        emitter.on(Commands.UPDATE, TallyDmHandler.runDescribe);

        // show existing tallies
        emitter.on(Commands.SHOW, TallyDmHandler.runShow);

        // get tally details
        emitter.on(Commands.DETAILS, TallyDmHandler.runGet);
        emitter.on(Commands.GET, TallyDmHandler.runGet);

        // bump a tally
        emitter.on(Commands.BUMP, TallyDmHandler.runBump);

        // dump a tally
        emitter.on(Commands.DUMP, TallyDmHandler.runDump);

        // set a tally to an amount
        emitter.on(Commands.SET, TallyDmHandler.runSet);

        // set a tally to 0
        emitter.on(Commands.EMPTY, TallyDmHandler.runEmpty);

        // empty all tallies to 0
        emitter.on(Commands.EMPTY_ALL, TallyDmHandler.runEmptyAll);

        // report a bug
        emitter.on(Commands.BUG, bug);
        emitter.on(Commands.REPORT, bug);

        // make a suggestion
        emitter.on(Commands.SUGGEST, suggest);

        // test command functionality
        emitter.on(Commands.TEST, test);
        emitter.on(Commands.T, test);

        // give help
        emitter.on(Commands.HELP, help);
        emitter.on(Commands.H, help);

        // get invite link
        emitter.on(Commands.INVITE, CmdHandler.runInvite);


        /**
         * The following commands are only exposed when bot is run without `production` flag
         */
        if (Env.isProduction() === false) {
            emitter.on(Commands.GENERATE, TallyDmHandler.runGenerate);
        }
    }
}