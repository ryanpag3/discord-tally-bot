import DB from './db-new';

/**
 * initialize internal tallies to the database
 */
// export const init = async () => {
//     await initBumpCounter();
//     await initDumpCounter();
// }

// const initBumpCounter = async () => {
//    // return await db.createBumpCounter();
// }

// export const increaseTotalBumpCount = async () => {
//     // return await db.increaseBumpCounter();
// }

// const initDumpCounter = async () => {
//     // return await db.createDumpCounter();
// }

// export const increaseTotalDumpCount = async () => {
//     // return await db.increaseDumpCounter();
// }

export default class Counter {
    static BUMP_COUNTER = 'BUMP_COUNTER';
    static DUMP_COUNTER = 'DUMP_COUNTER';
    static INTERNAL = 'INTERNAL';

    static async init() {
        await Counter.initBumpCounter();
        await Counter.initDumpCounter();
    }

    static async initBumpCounter() {

    }

    static async initDumpCounter() {

    }

    static async initCounter(name) {
        const db = new DB()
        const Tally = db.Tally;
        const existingCounter = await Tally.findOne({
            where: {
                name: name,
                channelId: Counter.INTERNAL,
                serverId: null
            }
        });
        
        if (existingCounter) {
            return this.overwriteServerId(existingCounter);
        }

        try {
            
        } catch (e) {

        }
    }

    private static async overwriteServerId(tally) {
        tally.serverId = Counter.INTERNAL;
        tally.isGlobal = true;
        await tally.save();
    }

    static async bumpTotalBumps() {

    }

    static async bumpTotalDumps() {

    }
}