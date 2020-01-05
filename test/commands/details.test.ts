import { expect } from 'chai';
import TestHelper from '../test-helper';
import DB from '../../util/db';
import Counter from '../../util/counter';
import TallyCmdHandler from '../../command-handlers/tally-cmd-handler';

describe('details command', function() {
    const TALLY_NAME = 'details-test';
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

    it('should respond with the details of a valid tally', async function() {
        const command = `!tb get ${TALLY_NAME}`;
        const fakeMsg = TestHelper.getFakeMessage();
        fakeMsg.content = command + ' ' + TALLY_NAME;
        await db.createTally(fakeMsg.getChannelId(), fakeMsg.getGuildId(), false, TALLY_NAME, 'woop');
        await TallyCmdHandler.runDetails(fakeMsg as any);
        expect(JSON.stringify(fakeMsg.channel.send.getCall(0).lastArg)).contains('woop'); 
    });

    it('should respond with a warning if tally doesnt exist', async function() {
        const command = `!tb get ${TALLY_NAME}`;
        const fakeMessage = TestHelper.getFakeMessage();
        fakeMessage.content = command + ' ' + TALLY_NAME;
        await TallyCmdHandler.runDetails(fakeMessage as any);
        expect(fakeMessage.channel.send.getCall(0).lastArg.description).contains('does not exist'); 
    });
});