import { expect, assert } from 'chai';
import DB from '../../util/db';

describe('db.ts', function() {
    const CHANNEL_ID = 'oh-hi-mark';
    const SERVER_ID = 'youre-tearing-me-apart';
    const IS_GLOBAL = false;
    const NAME = 'tommy';
    const DESCRIPTION = 'OH HAI MARK!';

    const db = new DB();

    before(async () => {
        await db.initDatabase();
    });

    afterEach(async function() {
        this.timeout(5000);
        await db.truncateTables();
    });

    after(async () => {
        await db.dropDatabase();
    })

    it('.initDatabase should create a database with tables', async () => {
        await db.dropDatabase();
        await db.initDatabase();
        const exists = await db.databaseExists(db.dbName);
        expect(exists).to.be.true;
        const tables = await db.getTables();
        expect(tables.length).to.be.greaterThan(0);
    });

    it('.createTally should create a tally', async () => {
        await db.createCmdTally(CHANNEL_ID, SERVER_ID, IS_GLOBAL, NAME, DESCRIPTION);
        const Tally = await db.Tally.findOne({
            where: {
                channelId: CHANNEL_ID,
                serverId: SERVER_ID,
                name: NAME
            }
        });
        expect(Tally).to.not.be.null;
    });

    it('.createTally should throw an exception with invalid description', async () => {
        try {
            await db.createCmdTally(CHANNEL_ID, SERVER_ID, IS_GLOBAL, NAME, DESCRIPTION.repeat(100));
        } catch (e) {
            expect(e).to.exist;
        }
    });

    it('.createTally should throw an exception if it has already been created', async () => {
        let error = null;
        try {
            await createTestTally();
            await createTestTally();
        } catch (e) {
            // logger.info(e);
            error = e;
        }
        expect(error).to.not.be.null;
    });

    it('.getTally should return a valid tally', async () => {
        await createTestTally();
        const tally = await db.getCmdTally(CHANNEL_ID, SERVER_ID, IS_GLOBAL, NAME);
        expect(tally.name).eqls(NAME);
    });

    it('.getTally should return null if no tally is defined', async () => {
        const tally = await db.getCmdTally(CHANNEL_ID, SERVER_ID, IS_GLOBAL, NAME);
        expect(tally).to.be.null;
    });

    it('.getTallies should return all valid tallies', async () => {
        await createTestTally('one');
        await createTestTally('two');
        await createTestTally('three');
        const tallies = await db.getCmdTallies(CHANNEL_ID, SERVER_ID, IS_GLOBAL);
        expect(tallies.length).eqls(3);
    });

    it('.setTallyDescription should update a tallys description', async () => {
        let tally = await createTestTally();
        const newDescription = 'woop';
        await db.setCmdTallyDescription(CHANNEL_ID, SERVER_ID, IS_GLOBAL, NAME, newDescription);
        tally = await db.getCmdTally(CHANNEL_ID, SERVER_ID, IS_GLOBAL, NAME);
        expect(tally.description).eqls(newDescription);
    });

    it('.setTallyDescription should throw an error if tally doesnt exist', async () => {
        let err;
        try {
            const newDescription = 'woop';
            await db.setCmdTallyDescription(CHANNEL_ID, SERVER_ID, IS_GLOBAL, NAME, newDescription);
        } catch (e) {
            err = e;
        }
        expect(err).to.not.be.undefined;
    });

    it('.setTallyDescription should throw an error if description is too long', async () => {
        let err;
        try {
            const newDescription = 'woop';
            await createTestTally();
            await db.setCmdTallyDescription(CHANNEL_ID, SERVER_ID, IS_GLOBAL, NAME, newDescription.repeat(1000));
        } catch (e) {
            err = e;
        }
        expect(err).to.not.be.undefined;
    });

    it('.updateTally should throw an error if tally doesnt exist', async () => {
        let err;
        try {
            await db.updateTally(CHANNEL_ID, SERVER_ID, IS_GLOBAL, NAME, {});
        } catch (e) {
            err = e;
        }
        expect(err).to.not.be.undefined;
    });

    it('.updateTally should update a valid tally', async () => {
        await createTestTally();
        const up = {
            serverId: '1234'
        };
        await db.updateTally(CHANNEL_ID, SERVER_ID, IS_GLOBAL, NAME, up);
        const tally = await db.getCmdTally(CHANNEL_ID, up.serverId, IS_GLOBAL, NAME);
        expect(tally).to.exist;
    });

    it('.deleteTally should delete a valid tally', async () => {
        await createTestTally();
        const up = {
            serverId: '1234'
        };
        await db.deleteCmdTally(CHANNEL_ID, SERVER_ID, IS_GLOBAL, NAME);
        const tally = await db.getCmdTally(CHANNEL_ID, up.serverId, IS_GLOBAL, NAME);
        expect(tally).to.not.exist;
    });

    it('.deleteTally should throw an error if tally doesnt exist', async () => {
        let err;
        try {
            await db.deleteCmdTally(CHANNEL_ID, SERVER_ID, IS_GLOBAL, NAME);
        } catch (e) {
            err = e;
        }
        expect(err).to.not.be.undefined;
    });

    it('.getKeywords should get all keywords for a channel', async () => {
        const kw = 'test';
        await createTestTally(null, kw);
        const keywords = await db.getKeywords(CHANNEL_ID, SERVER_ID);
        expect(keywords[0]).eqls(kw);
    });

    it('.keywordExists should return true if exists', async () => {
        const kw = 'test';
        await createTestTally(null, kw);
        const exists = await db.keywordExists(CHANNEL_ID, kw);
        expect(exists).eqls(true);
    });

    it('.keywordExists should return false if doesnt exist', async () => {
        const kw = 'test';
        const exists = await db.keywordExists(CHANNEL_ID, kw);
        expect(exists).eqls(false);
    });

    it('.bumpKeywordTally should increase valid tally', async () => {
        const mName = 'ryan';
        const kw = 'test';
        await createTestTally(mName, kw);
        await db.handleKeywordTally(SERVER_ID, kw, CHANNEL_ID);
        const tally = await db.getCmdTally(CHANNEL_ID, SERVER_ID, IS_GLOBAL, mName);
        expect(tally.count).eqls(1);
    });

    it('.bumpKeywordTally should not increase invalid tally', async () => {
        const mName = 'ryan';
        const kw = 'test';
        await createTestTally(mName, kw + 'a');
        await db.handleKeywordTally(CHANNEL_ID, kw);
        const tally = await db.getCmdTally(CHANNEL_ID, SERVER_ID, IS_GLOBAL, mName);
        expect(tally.count).eqls(0);
    });

    it('.createAnnouncement should create a valid announcement', async () => {
        await createTestAnnouncement();
        const announce = await db.Announcement.findOne({
            where: {
                channelId: CHANNEL_ID,
                name: NAME
            }
        });
        expect(announce).to.not.be.null;
    });

    it('.upsertAnnouncement should create a valid announcement', async () => {
        await db.upsertAnnouncement(CHANNEL_ID, NAME, DESCRIPTION);
        const announce = await db.Announcement.findOne({
            where: {
                channelId: CHANNEL_ID,
                name: NAME
            }
        });
        expect(announce).to.not.be.null;
    });

    it('.upsertAnnouncement should update a valid announcement', async () => {
        await createTestAnnouncement();
        await db.upsertAnnouncement(CHANNEL_ID, NAME, 'description changed');
        const announce = await db.Announcement.findOne({
            where: {
                channelId: CHANNEL_ID,
                name: NAME
            }
        });
        expect(announce.description).eqls('description changed');
        const announces = await db.Announcement.findAll();
        expect(announces.length).eqls(1);
    });

    it('.deleteAnnouncement should delete a valid announcement', async () => {
        await createTestAnnouncement();
        await db.deleteAnnouncement(CHANNEL_ID, NAME);
        const announce = await db.Announcement.findOne({
            where: {
                channelId: CHANNEL_ID,
                name: NAME
            }
        });
        expect(announce).to.be.null;
    });

    it('.activateAnnouncement should activate a valid announcement', async () => {
        await createTestAnnouncement();
        await db.activateAnnouncement(CHANNEL_ID, NAME);
        const announce = await db.Announcement.findOne({
            where: {
                channelId: CHANNEL_ID,
                name: NAME
            }
        });
        expect(announce.active).to.be.true;
    });

    it('.activateAnnouncement should throw an error if announcement doesnt exist', async () => {
        let err;
        try {
            await db.activateAnnouncement(CHANNEL_ID, NAME);
        } catch (e) {
            err = e;
        }
        expect(err).to.not.be.undefined;
    });

    it('.setAnnounceName should update a valid announcement', async () => {
        await createTestAnnouncement();
        await db.setAnnounceName(CHANNEL_ID, NAME, 'newname');
        const announce = await db.Announcement.findOne({
            where: {
                channelId: CHANNEL_ID,
                name: 'newname'
            }
        });
        expect(announce.name).eqls('newname');
        const announces = await db.Announcement.findAll();
        expect(announces.length).eqls(1);
    });

    it('.setAnnounceName should throw an error if announcement doesnt exist', async () => {
        let err;
        try {
            await db.setAnnounceName(CHANNEL_ID, NAME, '');
        } catch (e) {
            err = e;
        }
        expect(err).to.not.be.undefined;
    });

    it('.setAnnounceDesc should update a valid announcement', async () => {
        await createTestAnnouncement();
        await db.setAnnounceDesc(CHANNEL_ID, NAME, 'new desc');
        const announce = await db.Announcement.findOne({
            where: {
                channelId: CHANNEL_ID,
                name: NAME
            }
        });
        expect(announce.description).eqls('new desc');
        const announces = await db.Announcement.findAll();
        expect(announces.length).eqls(1);
    });

    it('.setAnnounceDesc should throw an error if announcement doesnt exist', async () => {
        let err;
        try {
            await db.setAnnounceDesc(CHANNEL_ID, NAME, '');
        } catch (e) {
            err = e;
        }
        expect(err).to.not.be.undefined;
    });

    it('.setAnnounceTallyGoal should update a valid announcement', async () => {
        await createTestAnnouncement();
        await db.setAnnounceTallyGoal(CHANNEL_ID, NAME, 'test', '100');
        const announce = await db.Announcement.findOne({
            where: {
                channelId: CHANNEL_ID,
                name: NAME
            }
        });
        expect(announce.tallyName).eqls('test');
        expect(announce.tallyGoal).eqls(100);
    });

    it('.setAnnounceTallyGoal should throw an error if announcement doesnt exist', async () => {
        let err;
        try {
            await db.setAnnounceTallyGoal(CHANNEL_ID, NAME, '', '');
        } catch (e) {
            err = e;
        }
        expect(err).to.not.be.undefined;
    });

    it('.setAnnounceDate should update a valid announcement', async () => {
        await createTestAnnouncement();
        await db.setAnnounceDate(CHANNEL_ID, NAME, '* * * * *');
        const announce = await db.Announcement.findOne({
            where: {
                channelId: CHANNEL_ID,
                name: NAME
            }
        });
        expect(announce.datePattern).eqls('* * * * *');
    });

    it('.setAnnounceDate should throw an error if announcement doesnt exist', async () => {
        let err;
        try {
            await db.setAnnounceDate(CHANNEL_ID, NAME, '');
        } catch (e) {
            err = e;
        }
        expect(err).to.not.be.undefined;
    });

    it('.deleteAnnounce should delete a valid announcement', async () => {
        await createTestAnnouncement();
        await db.deleteAnnounce(CHANNEL_ID, NAME);
        const announce = await db.Announcement.findOne({
            where: {
                channelId: CHANNEL_ID,
                name: NAME
            }
        });
        expect(announce).eqls(null);
    });

    async function createTestAnnouncement(name?: string, description?: string) {
        return await db.createAnnouncement(CHANNEL_ID, name || NAME, description || DESCRIPTION);
    }

    async function createTestTally(name?: string, keyword?: string) {
        return await db.createCmdTally(CHANNEL_ID, SERVER_ID, IS_GLOBAL, name || NAME, DESCRIPTION, keyword);
    }
});
