import UserUtil from "../../util/user";
import DB from "../../util/db";

describe('user.test.ts', function() {

    const db = new DB();

    before(async () => {
        await db.initDatabase();
    });

    afterEach(async function() {
        this.timeout(25000);
        await db.truncateTables();
    });

    after(async () => {
        await db.dropDatabase();
    })

    it('should handle a lot of users', async function() {
        this.timeout(120000);
        const users = [];
        const amt = 10000;
        for (let i = 1; i <= amt; i++) {
            users.push({
                id: i,
                tag: `ryan-` + i
            });
        }
        await UserUtil.initAll(users);
    });
})