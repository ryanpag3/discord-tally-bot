import { expect } from 'chai';
import DB from '../../util/db-new';

describe('db-new.test.ts', function() {

    it('.initDatabase should create a database with tables', async () => {
        const databaseName = 'automated_test_db';
        const db = new DB(databaseName);
        await db.initDatabase();
        const exists = await db.databaseExists(databaseName);
        expect(exists).to.be.true;
        const tables = await db.getTables();
        expect(tables.length).to.be.greaterThan(0);
        let result = await db.dropDatabase(databaseName);
        expect(result).to.be.true;
    });

    it('.createTally should create a tally', async () => {
        const channelId = 'ohhimark';
        const serverId = 'ohhimark';
        const isGlobal = false;
        const name = 'ohhimark';
        const description = 'ohhimark';
        const db = new DB('automated_test_db');
        await db.initDatabase();
        await db.createTally(
            channelId,
            serverId,
            isGlobal,
            name,
            description
        );
    })

});