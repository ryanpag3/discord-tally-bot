import { expect } from 'chai';
import TestHelper from '../test-helper';
import DB from '../../util/db';
import Counter from '../../util/counter';
import TallyHandler from '../../command-handlers/tally-handler';

describe('describe command', function() {
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

    it('should update the description of a valid tally', async function() {
        const fakeMsg = TestHelper.getFakeMessage();
        const desc = 'newdesc';
        fakeMsg['content'] = `!tb describe ${TALLY_NAME} ${desc}`;
        const tally = await db.createCmdTally(fakeMsg.getChannelId(), fakeMsg.getGuildId(), false, TALLY_NAME, '');
        await TallyHandler.runDescribe(fakeMsg as any);
        await tally.reload();
        expect(tally.description).not.eqls('');
    });

    it('should respond with a warning if tally doesnt exist', async function() {
        const command = `!tb describe ${TALLY_NAME} doesnt matter`;
        const fakeMessage = TestHelper.getFakeMessage();
        fakeMessage.content = command + ' ' + TALLY_NAME;
        await TallyHandler.runDescribe(fakeMessage as any);
        expect(fakeMessage.channel.send.getCall(0).lastArg.description).contains('Could not find'); 
    });
});