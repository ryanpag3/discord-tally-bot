import DB from './db';
import logger from './logger';

export default class Counter {
    static BUMP_COUNTER = 'BUMP_COUNTER';
    static DUMP_COUNTER = 'DUMP_COUNTER';
    static INTERNAL = 'INTERNAL';

    static async init() {
        await Counter.initBumpCounter();
        await Counter.initDumpCounter();
    }

    static async initBumpCounter() {
        return await Counter.initCounter(Counter.BUMP_COUNTER);
    }

    static async initDumpCounter() {
        return await Counter.initCounter(Counter.DUMP_COUNTER);
    }

    static async initCounter(name) {
        const db = new DB();
        const Tally = db.Tally;
        const existingCounter = await Tally.findOne({
            where: {
                name: name,
                channelId: Counter.INTERNAL,
                serverId: null
            }
        });

        if (existingCounter) {
            return await this.overwriteServerId(existingCounter);
        }

        try {
            await db.createCmdTally(Counter.INTERNAL, Counter.INTERNAL, true, name, 'Internal tally for ' + name);
        } catch (e) {
            if (!e.message.includes('Validation error'))
                logger.info(e);
        }
    }

    private static async overwriteServerId(tally) {
        tally.serverId = Counter.INTERNAL;
        tally.isGlobal = true;
        await tally.save();
    }

    static async bumpTotalBumps() {
        return await this.bumpTotal(Counter.BUMP_COUNTER);
    }

    static async bumpTotalDumps() {
        return await this.bumpTotal(Counter.DUMP_COUNTER);
    }

    private static async bumpTotal(name) {
        try {
            const db = new DB();
            const tally = await db.Tally.findOne({
                where: {
                    name,
                    channelId: Counter.INTERNAL,
                    serverId: Counter.INTERNAL
                }
            });
            tally.count++;
            await tally.save();
        } catch (e) {
            logger.info(e);
        }
    }

    static async getCount(name: string, channelId: string) {
        try {
            const db = new DB();
            let tally = await db.Tally.findOne({
                where: {
                    name: name,
                    channelId: channelId
                }
            });
            return tally.count;
        } catch (e) {
            logger.info(`Error while getting count for ${name}: ${e}`);
        }
    }

    static async getDumpCount() {
        try {
            return await this.getCount(Counter.DUMP_COUNTER, Counter.INTERNAL);
        } catch (e) {
            logger.info(`Error while getting dump count ${e}`);
        }
    }

    static async getBumpCount() {
        try {
            return await this.getCount(Counter.BUMP_COUNTER, Counter.INTERNAL);
        } catch (e) {
            logger.info('Error while getting bump count: ' + e);
        }
    }
}
