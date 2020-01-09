import { expect } from 'chai';
import TestHelper from '../test-helper';
import DB from '../../util/db';
import Counter from '../../util/counter';
import TallyHandler from '../../command-handlers/tally-handler';

describe('create command', function() {
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

    it('should create a tally', async function() {
        const fakeMsg = TestHelper.getFakeMessage();
        fakeMsg['content'] = '!tb add ' + TALLY_NAME;
        await TallyHandler.runCreate(fakeMsg as any);
        const tally = await db.getCmdTally(fakeMsg.getChannelId(), fakeMsg.getGuildId(), false, TALLY_NAME);
        expect(tally).to.exist;
    });

    it('should respond with a warning if tally exists already', async function() {
        const command = `!tb add`;
        const fakeMessage = TestHelper.getFakeMessage();
        fakeMessage.content = command + ' ' + TALLY_NAME;
        await db.createCmdTally(fakeMessage.getChannelId(), fakeMessage.getGuildId(), false, TALLY_NAME, '');
        await TallyHandler.runCreate(fakeMessage as any);
        expect(fakeMessage.getLastChannelCall('description')).contains('already exists'); 
    });
});