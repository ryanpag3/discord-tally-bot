import DB from "../../util/db";
import KeywordUtil from "../../util/keyword-util";

const db = new DB();

describe('keyword-util.ts', function() {
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

    it ('should do', async function() {
        
        await KeywordUtil.loadKeywordServersToCache();
    })
});