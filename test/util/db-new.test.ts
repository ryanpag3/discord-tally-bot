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
        console.log(result);
        result = await db.dropDatabase(databaseName);
        console.log(result);
    });

});