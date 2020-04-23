import { expect } from 'chai';
import sinon from 'sinon';
import TestHelper from "../test-helper";
import bug from '../../commands/bug';
import Counter from '../../util/counter';
import DB from '../../util/db';

describe('bug command', function() {
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

    it('should send the bug report', async function() {
        const command = `!tb bug buggy`;
        const fakeMessage = TestHelper.getFakeMessage();
        const fakeBot = TestHelper.getFakeBot();
        fakeMessage['content'] = command;
        await bug({ bot: fakeBot, message: fakeMessage, channelId: '1' });
        expect(fakeMessage.getLastChannelCall()).contains('has been sent');
    });
});