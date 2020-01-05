import { expect } from 'chai';
import TallyCmdHandler from '../../command-handlers/tally-cmd-handler';
import TestHelper from '../test-helper';
import DB from '../../util/db';
import Counter from '../../util/counter';

describe('tally-common.ts', function() {
    const db = new DB();

    before(async () => {
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

    it('should return the correct action based on boolean', function(done) {
        const bump = TallyCmdHandler.getBumpOrDump(true);
        expect(bump).eqls('bump');
        const dump = TallyCmdHandler.getBumpOrDump(false);
        expect(dump).eqls('dump');
        done();
    })

    it('should append a string to the action', function(done) {
        const bumping = TallyCmdHandler.getBumpOrDump(true, 'ing');
        expect(bumping).eqls('bumping');
        const dumping = TallyCmdHandler.getBumpOrDump(false, 'ing');
        expect(dumping).eqls('dumping');
        done();
    });

    it('should unmarshall a count message', async function() {
        let msg = TestHelper.getFakeMessage();
        msg.content = `!tb bump test 100`;
        const obj = TallyCmdHandler.unMarshall(msg as any);
        expect(obj.isGlobal).is.false;
        expect(obj.tallyName).eqls('test');
        expect(obj.amount).eqls(100);
        expect(obj.command).eqls('!tb bump');
    });

    it('should unmarshall a global count message', async function() {
        let msg = TestHelper.getFakeMessage();
        msg.content = `!tb bump -g test 100`;
        const obj = TallyCmdHandler.unMarshall(msg as any);
        expect(obj.isGlobal).is.true;
        expect(obj.tallyName).eqls('test');
        expect(obj.amount).eqls(100);
        expect(obj.command).eqls('!tb bump');
    });

    it('should throw an error with invalid command', async function() {
        let msg = TestHelper.getFakeMessage();
        msg.content = `!tb bump`;
        try{
            TallyCmdHandler.unMarshall(msg as any);
            expect(true).to.be.false; // force failure if error isnt raised above
        } catch (e) {
            expect(e).to.exist;
        }
    });

    it('should bump a tally', async function() {
        let msg = TestHelper.getFakeMessage();
        msg.content = `!tb bump test`;
        const tally = await db.createTally(msg.getChannelId(), msg.getGuildId(), false, 'test', '');
        await TallyCmdHandler.runBump(msg as any);
        await tally.reload();
        expect(tally.count).eqls(1);
    })

    it('should bump a tally by count', async function() {
        let msg = TestHelper.getFakeMessage();
        msg.content = `!tb bump test 100`;
        const tally = await db.createTally(msg.getChannelId(), msg.getGuildId(), false, 'test', '');
        await TallyCmdHandler.runBump(msg as any);
        await tally.reload();
        expect(tally.count).eqls(100);
    })
});