import { expect } from 'chai';
import TestHelper from '../test-helper';
import DB from '../../util/db';
import Counter from '../../util/counter';
import TallyCmdHandler from '../../command-handlers/tally-cmd-handler';

describe('global command', function() {
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

    it('should set a tally to be global scoped', async function() {
        const fakeMsg = TestHelper.getFakeMessage();
        fakeMsg.content = `!tb channel ${TALLY_NAME}`;
        const tally = await db.createTally(fakeMsg.getChannelId(), fakeMsg.getGuildId(), false, TALLY_NAME, 'woop');
        await TallyCmdHandler.runGlobal(fakeMsg as any);
        await tally.reload();
        expect(tally.isGlobal).is.true; 
    });

    it('should warn when a global tally already exists', async function() {
        const fakeMsg = TestHelper.getFakeMessage();
        fakeMsg.content = `!tb channel ${TALLY_NAME}`;
        await db.createTally(fakeMsg.getChannelId(), fakeMsg.getGuildId(), false, TALLY_NAME, 'woop');
        await db.createTally(fakeMsg.getChannelId(), fakeMsg.getGuildId(), true, TALLY_NAME, 'woop');
        await TallyCmdHandler.runGlobal(fakeMsg as any);
        expect(fakeMsg.getLastChannelCall('description')).contains('already a tally with name'); 
    });
});