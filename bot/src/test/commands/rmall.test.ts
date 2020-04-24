import { expect } from 'chai';
import TestHelper from '../test-helper';
import DB from '../../util/db';
import Counter from '../../util/counter';
import rmall from '../../commands/rmall';

describe('rmall command', function() {
    const TALLY_NAME = 'set-test';
    const db = new DB();

    before(async () => {
        TestHelper.exportDBEnvironmentVar();
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
        TestHelper.resetDBEnvVar();
    });

    it('should remove all', async function() {
        const fakeMsg = TestHelper.getFakeMessage();
        fakeMsg.content = `!tb rmall`;
        await db.createCmdTally(fakeMsg.getChannelId(), fakeMsg.getGuildId(), true, TALLY_NAME, 'woop');
        const count = await db.getTallyCount();
        await rmall(fakeMsg as any);
        const newCount = await db.getTallyCount();
        expect(count).greaterThan(newCount);
    });
});