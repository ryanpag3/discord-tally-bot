import DB from '../../util/db';
import TestHelper from '../test-helper';
import Counter from '../../util/counter';
import runDelete from '../../commands/delete';

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
        const tally = await db.createTally(fakeMessage.getChannelId(), fakeMessage.getGuildId(), false, TALLY_NAME, '');
        await runDelete(fakeMessage as any);
    });

});