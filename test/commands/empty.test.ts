import { expect } from 'chai';
import TestHelper from '../test-helper';
import DB from '../../util/db';
import Counter from '../../util/counter';
import Bluebird = require('bluebird');
import TallyCmdHandler from '../../command-handlers/tally-cmd-handler';

describe('empty command', function() {
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

    it('should set a tallys count to 0', async function() {
        const fakeMsg = TestHelper.getFakeMessage();
        fakeMsg['content'] = '!tb empty ' + TALLY_NAME;
        await db.createCmdTally(fakeMsg.getChannelId(), fakeMsg.getGuildId(), false, TALLY_NAME, '');
        await db.updateTally(fakeMsg.getChannelId(), fakeMsg.getGuildId(), false, TALLY_NAME, {
            count: 100
        });
        await TallyCmdHandler.runEmpty(fakeMsg as any);
        await Bluebird.delay(10);
        const tally = await db.getTally(fakeMsg.getChannelId(), fakeMsg.getGuildId(), false, TALLY_NAME);
        expect(tally.count).eqls(0);
    });

    it('should respond with a warning if tally doesnt exist', async function() {
        const command = `!tb bump`;
        const fakeMessage = TestHelper.getFakeMessage();
        fakeMessage.content = command + ' ' + TALLY_NAME;
        await TallyCmdHandler.runEmpty(fakeMessage as any);
        expect(fakeMessage.channel.send.getCall(0).lastArg.description).contains('Could not find'); 
    });
});