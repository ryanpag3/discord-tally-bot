import { expect } from 'chai';
import TestHelper from '../test-helper';
import DB from '../../util/db';
import Counter from '../../util/counter';
import TallyCmdHandler from '../../command-handlers/tally-cmd-handler';

describe('empty-all command', function() {
    const TALLY_NAME = 'set-test';
    const db = new DB();

    before(async () => {
        await db.initDatabase();
    })

    beforeEach(async () => {
        await Counter.init();
    });

    afterEach(async () => {
        await db.truncateTables();
    });

    after(async () => {
        await db.dropDatabase();
    });

    it('should empty all tallies', async function() {
        const fakeMsg = TestHelper.getFakeMessage();
        fakeMsg.content = `!tb empty-all`;
        await db.createTally(fakeMsg.getChannelId(), fakeMsg.getGuildId(), true, TALLY_NAME, 'woop');
        await db.updateTallies(fakeMsg.getGuildId(), fakeMsg.getGuildId(), true, { count: 100 });
        await TallyCmdHandler.runEmptyAll(fakeMsg as any);
        const tallies = await db.getTallies(fakeMsg.getChannelId(), fakeMsg.getGuildId(), false);
        tallies.map(t => {
            expect(t.count).eqls(0);
        });
    });

    // TODO: this needs more test coverage
});