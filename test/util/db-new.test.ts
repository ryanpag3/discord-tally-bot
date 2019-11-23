import { expect } from 'chai';
import DB from '../../util/db-new';

describe('db-new.test.ts', function() {
    const DB_NAME = 'tallybot_automated_test_db';
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
        const channelId = 'ohhimark';
        const serverId = 'ohhimark';
        const isGlobal = false;
        const name = 'ohhimark';
        const description = 'ohhimark';
        await db.createTally(
            channelId,
            serverId,
            isGlobal,
            name,
            description
        );
        const Tally = await db.Tally.findOne({
            where: {
                channelId,
                serverId,
                name
            }
        });
        expect(Tally).to.not.be.null;
    })

    it('.createTally should throw an exception with invalid description', async () => {

    });

});