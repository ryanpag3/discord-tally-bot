import { expect } from 'chai';
import TestHelper from "../test-helper";
import timers from '../../commands/timers';
import DB from '../../util/db';

describe('timers command', function() {
    const db = new DB();

    before(async () => {
        await db.initDatabase();
    })

    afterEach(async () => {
        await db.truncateTables();
    });

    after(async () => {
        await db.dropDatabase();
    });

    it('should show timers', async function() {
        let fakeMsg = TestHelper.getFakeMessage();
        fakeMsg.content = `!tb timers`;
        const amt = 25;
        await createTimers(fakeMsg.getChannelId(), amt);
        await timers(fakeMsg as any);
        expect(fakeMsg.getLastChannelCall()).contains(`${amt} timers`);
    })

    async function createTimers(channelId: string, amt: number) {
        for (let i = 0; i < amt; i++) {
            await db.createTimer(channelId, 'generated ' + i);
        }
    }
});