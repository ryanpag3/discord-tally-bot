import { expect } from 'chai';
import TestHelper from '../test-helper';
import DB from '../../util/db';
import Counter from '../../util/counter';
import TallyHandler from '../../message/command/tally-handler';

describe('set command', function() {
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

    it('should set the count of a valid tally', async function() {
        const fakeMsg = TestHelper.getFakeMessage();
        fakeMsg.content = `!tb set ${TALLY_NAME} 100`;
        await db.createCmdTally(fakeMsg.getChannelId(), fakeMsg.getGuildId(), false, TALLY_NAME, 'woop');
        await TallyHandler.runSet(fakeMsg as any);
        expect(JSON.stringify(fakeMsg.channel.send.getCall(0).lastArg)).contains('woop'); 
    });

    it('should respond with a warning if tally doesnt exist', async function() {
        const fakeMessage = TestHelper.getFakeMessage();
        fakeMessage.content = `!tb set ${TALLY_NAME} 42`;
        await TallyHandler.runSet(fakeMessage as any);
        expect(fakeMessage.channel.send.getCall(0).lastArg.description).contains('Could not find'); 
    });
});