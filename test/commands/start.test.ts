import { expect } from 'chai';
import TestHelper from "../test-helper";
import start from '../../commands/start';
import DB from '../../util/db';

describe('start command', function() {
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

    it('should start a new announcement', async function() {
        let fakeMsg = TestHelper.getFakeMessage();
        fakeMsg.content = `!tb start ${TIMER_NAME}`;
        await db.createTimer(fakeMsg.getChannelId(), TIMER_NAME);
        await start(fakeMsg as any);
        const t = await db.getTimer(fakeMsg.getChannelId(), TIMER_NAME);
        expect(t.startDate).to.not.be.null;
    });
});