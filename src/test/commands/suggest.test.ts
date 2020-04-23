import { expect } from 'chai';
import TestHelper from "../test-helper";
import suggest from '../../commands/suggest';
import Counter from '../../util/counter';
import DB from '../../util/db';

describe('suggest command', function() {
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

    it('should send the suggest report', async function() {
        const command = `!tb suggest be better`;
        const fakeMessage = TestHelper.getFakeMessage();
        const fakeBot = TestHelper.getFakeBot();
        fakeMessage['content'] = command;
        await suggest({ bot: fakeBot, message: fakeMessage, channelId: '1' });
        expect(fakeMessage.getLastChannelCall()).contains('has been sent');
    });
});