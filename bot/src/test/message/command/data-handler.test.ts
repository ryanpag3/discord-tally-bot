import { expect } from 'chai';
import DataHandler from '../../../message/command/data-handler';
import TestHelper from '../../test-helper';
import DB from '../../../util/db';
import logger from '../../../util/logger';

describe('data-handler.ts', function() {
    let message = TestHelper.getFakeMessage();
    const db = new DB();

    before(async () => {
        await db.initDatabase();
    })

    beforeEach(async () => {

    });

    afterEach(async () => {
        await db.truncateTables();
    });

    after(async () => {
        await db.dropDatabase();
    });

    it('should export a file to be sent', async function() {
        message.content = `!tb data -export tallies,timers,announcements`;
        await DataHandler.runExport(message as any);
        const call = JSON.parse(message.getLastChannelCall());
        expect(call.files.length).to.be.greaterThan(0);
    });
    
});