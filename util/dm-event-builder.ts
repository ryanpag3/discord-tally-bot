import { EventEmitter } from 'events';
import Commands from '../static/Commands';
import TallyDmHandler from '../dm-handler/tally-dm-handler';

export default class DmEventBuilder {
    static build(emitter: EventEmitter) {
        // create a tally
        emitter.on(Commands.CREATE, TallyDmHandler.runCreate);
        emitter.on(Commands.ADD, TallyDmHandler.runCreate);
    }
}