import { expect } from 'chai';
import TestHelper from "../test-helper";
import announcements from '../../commands/announcements';
import DB from '../../util/db';

describe('announcements command', function() {
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

    it('should create a new announcement', async function() {
        let fakeMsg = TestHelper.getFakeMessage();
        fakeMsg.content = `!tb announcements`;
        const amt = 25;
        await generateAnnouncements(fakeMsg.getChannelId(), amt);
        await announcements(fakeMsg as any);
        expect(fakeMsg.getLastChannelCall()).contains(`${amt} total`);
    })

    async function generateAnnouncements(channelId: string, amt: number) {
        for (let i = 0; i < amt; i++) {
            await db.createAnnouncement(channelId, 'generated ' + i, '');
        }
    }
});