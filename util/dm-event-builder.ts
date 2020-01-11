import { EventEmitter } from 'events';
import Commands from '../static/Commands';
import TallyDmHandler from '../dm-handler/tally-dm-handler';
import Env from './env';

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

        // set tally description
        emitter.on(Commands.DESCRIBE, TallyDmHandler.runDescribe);
        emitter.on(Commands.UPDATE, TallyDmHandler.runDescribe);

        // show existing tallies
        emitter.on(Commands.SHOW, TallyDmHandler.runShow);

        // get tally details
        emitter.on(Commands.DETAILS, TallyDmHandler.runGet);
        emitter.on(Commands.GET, TallyDmHandler.runGet);


        /**
         * The following commands are only exposed when bot is run without `production` flag
         */
        if (Env.isProduction() === false) {
            emitter.on(Commands.GENERATE, TallyDmHandler.runGenerate);
        }
    }
}