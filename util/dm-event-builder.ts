import { EventEmitter } from 'events';
import Commands from '../static/Commands';
import TallyDmHandler from '../dm-handler/tally-dm-handler';

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

    }
}