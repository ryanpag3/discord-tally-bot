import { expect } from 'chai';
import TestHelper from '../test-helper';
import DB from '../../util/db';
import Counter from '../../util/counter';
import TallyHandler from '../../command-handlers/tally-handler';

describe('show command', function() {
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

    it('should show existing tallies', async function() {
        const fakeMsg = TestHelper.getFakeMessage();
        fakeMsg.content = `!tb show`;
        const totalTallies = 100;
        for (let i = 0; i < totalTallies; i++) {
            await db.createTally(fakeMsg.getChannelId(), fakeMsg.getGuildId(), false, TALLY_NAME + i, 'a'.repeat(255));
        }
        await TallyHandler.runShow(fakeMsg as any);
        expect(fakeMsg.getLastChannelCall()).contains(`${totalTallies} total`); 
    });
});