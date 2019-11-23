import { expect, assert } from 'chai';
import DB from '../../util/db';

describe('db.ts', function() {
    const DB_NAME = 'tallybot_automated_test_db';
    const CHANNEL_ID = 'oh-hi-mark';
    const SERVER_ID = 'youre-tearing-me-apart';
    const IS_GLOBAL = false;
    const NAME = 'tommy';
    const DESCRIPTION = 'OH HAI MARK!';

    const db = new DB(DB_NAME);

    before(async () => {
        await db.initDatabase();
    });

    afterEach(async () => {
        await db.truncateTables();
    });

    it('.initDatabase should create a database with tables', async () => {
        await db.dropDatabase();
        await db.initDatabase();
        const exists = await db.databaseExists(DB_NAME);
        expect(exists).to.be.true;
        const tables = await db.getTables();
        expect(tables.length).to.be.greaterThan(0);
    });

    it('.createTally should create a tally', async () => {
        await db.createTally(CHANNEL_ID, SERVER_ID, IS_GLOBAL, NAME, DESCRIPTION);
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
            await db.createTally(CHANNEL_ID, SERVER_ID, IS_GLOBAL, NAME, DESCRIPTION.repeat(100));
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
            // console.log(e);
            error = e;
        }
        expect(error).to.not.be.null;
    });

    it('.getTally should return a valid tally', async () => {
        await createTestTally();
        const tally = await db.getTally(CHANNEL_ID, SERVER_ID, IS_GLOBAL, NAME);
        expect(tally.name).eqls(NAME);
    });

    it('.getTally should return null if no tally is defined', async () => {
        const tally = await db.getTally(CHANNEL_ID, SERVER_ID, IS_GLOBAL, NAME);
        expect(tally).to.be.null;
    });

    it('.getTallies should return all valid tallies', async () => {
        await createTestTally('one');
        await createTestTally('two');
        await createTestTally('three');
        const tallies = await db.getTallies(CHANNEL_ID, SERVER_ID, IS_GLOBAL);
        expect(tallies.length).eqls(3);
    });

    it('.setTallyDescription should update a tallys description', async () => {
        let tally = await createTestTally();
        const newDescription = 'woop';
        await db.setTallyDescription(CHANNEL_ID, SERVER_ID, IS_GLOBAL, NAME, newDescription);
        tally = await db.getTally(CHANNEL_ID, SERVER_ID, IS_GLOBAL, NAME);
        expect(tally.description).eqls(newDescription);
    });

    it('.setTallyDescription should throw an error if tally doesnt exist', async () => {
        let err;
        try {
            const newDescription = 'woop';
            await db.setTallyDescription(CHANNEL_ID, SERVER_ID, IS_GLOBAL, NAME, newDescription);
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
            await db.setTallyDescription(CHANNEL_ID, SERVER_ID, IS_GLOBAL, NAME, newDescription.repeat(1000));
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
        const tally = await db.getTally(CHANNEL_ID, up.serverId, IS_GLOBAL, NAME);
        expect(tally).to.exist;
    });

    it('.deleteTally should delete a valid tally', async () => {
        await createTestTally();
        const up = {
            serverId: '1234'
        };
        await db.deleteTally(CHANNEL_ID, SERVER_ID, IS_GLOBAL, NAME, up);
        const tally = await db.getTally(CHANNEL_ID, up.serverId, IS_GLOBAL, NAME);
        expect(tally).to.exist;
    });

    async function createTestTally(name?: string) {
        return await db.createTally(CHANNEL_ID, SERVER_ID, IS_GLOBAL, name || NAME, DESCRIPTION);
    }
});
