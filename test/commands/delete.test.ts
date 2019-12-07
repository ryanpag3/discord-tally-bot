import { expect } from 'chai'; 
import DB from '../../util/db';
import TestHelper from '../test-helper';
import Counter from '../../util/counter';
import TallyHandler from '../../command-handlers/tally-handler';

describe('delete command', function() {
    const TALLY_NAME = 'empty-test';
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

    it('should delete a valid tally', async function() {
        let fakeMessage = TestHelper.getFakeMessage();
        fakeMessage.content = '!tb rm ' + TALLY_NAME;
        await db.createTally(fakeMessage.getChannelId(), fakeMessage.getGuildId(), false, TALLY_NAME, '');
        await TallyHandler.runDelete(fakeMessage as any);
        const tally = await db.getTally(fakeMessage.getChannelId(), fakeMessage.getGuildId(), false, TALLY_NAME);
        expect(tally).to.be.null;
    });

});