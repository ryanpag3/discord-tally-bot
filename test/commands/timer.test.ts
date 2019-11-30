import { expect } from 'chai';
import TestHelper from "../test-helper";
import timer from '../../commands/timer';
import DB from '../../util/db';

describe('timer command', function() {
    const db = new DB();
    const TIMER_DESC = 'for when i want to time something';
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

    it('should create a new announcement', async function() {
        let fakeMsg = TestHelper.getFakeMessage();
        fakeMsg.content = `!tb timer ${TIMER_NAME} ${TIMER_DESC}`;
        await timer(fakeMsg as any);
        const t = await db.getTimer(fakeMsg.getChannelId(), TIMER_NAME);
        expect(t).to.not.be.null;
    });

    it('should delete a new announcement', async function() {
        let fakeMsg = TestHelper.getFakeMessage();
        fakeMsg.content = `!tb timer ${TIMER_NAME} ${TIMER_DESC}`;
        await timer(fakeMsg as any);
        let t = await db.getTimer(fakeMsg.getChannelId(), TIMER_NAME);
        expect(t).to.not.be.null;
        fakeMsg = TestHelper.getFakeMessage();
        fakeMsg.content = `!tb timer rm ${TIMER_NAME}`;
        await timer(fakeMsg as any);
        t = await db.getTimer(fakeMsg.getChannelId(), TIMER_NAME);
        expect(t).to.be.null;
    });
});