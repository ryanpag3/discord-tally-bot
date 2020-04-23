import { expect } from 'chai';
import TestHelper from "../test-helper";
import stop from '../../commands/stop';
import start from '../../commands/start';
import DB from '../../util/db';

describe('stop command', function() {
    const db = new DB();
    const TIMER_NAME = 'timer';

    before(async () => {
        await db.initDatabase();
    })

    beforeEach(async () => {

    });

    afterEach(async () => {
        await db.truncateTables();
    });

    after(async () => {
        await db.dropDatabase();
    });

    it('should stop a timer', async function() {
        let fakeMsg = TestHelper.getFakeMessage();
        fakeMsg.content = `!tb start ${TIMER_NAME}`;
        await db.createTimer(fakeMsg.getChannelId(), TIMER_NAME);
        await start(fakeMsg as any);
        fakeMsg = TestHelper.getFakeMessage();
        fakeMsg.content = `!tb stop ${TIMER_NAME}`;
        await stop(fakeMsg as any);
        const t = await db.getTimer(fakeMsg.getChannelId(), TIMER_NAME);
        expect(t.startDate).to.be.null;
        expect(t.stopDate).to.not.be.null;
        expect(t.totTime).to.not.be.null;
    });
});