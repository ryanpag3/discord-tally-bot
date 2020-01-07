import { expect } from 'chai';
import TestHelper from '../test-helper';
import DB from '../../util/db';
import Counter from '../../util/counter';
import keyword from '../../commands/keyword';

describe('keyword command', function() {
    const TALLY_NAME = 'set-test';
    const KEYWORD = 'keyword';
    const db = new DB();

    before(async () => {
        TestHelper.exportDBEnvironmentVar();
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

    it('should create a keyword tally', async function() {
        const fakeMsg = TestHelper.getFakeMessage();
        fakeMsg.content = `!tb kw ${TALLY_NAME} ${KEYWORD}`;
        await keyword(fakeMsg as any);
        const tally = await db.getTally(fakeMsg.getChannelId(), fakeMsg.getGuildId(), false, TALLY_NAME);
        expect(tally).to.exist;
        expect(tally.keyword).eqls(KEYWORD);
    });

    it('should respond with a warning if a tally name isnt provided', async function() {
        const fakeMsg = TestHelper.getFakeMessage();
        fakeMsg.content = `!tb kw`;
        await keyword(fakeMsg as any);
        expect(fakeMsg.channel.send.getCall(0).lastArg.description).contains('name must be provided'); 
    });

    it('should respond with a warning if a tally keyword isnt provided', async function() {
        const fakeMsg = TestHelper.getFakeMessage();
        fakeMsg.content = `!tb kw ${TALLY_NAME}`;
        await keyword(fakeMsg as any);
        expect(fakeMsg.channel.send.getCall(0).lastArg.description).contains('keyword must be provided'); 
    });

    it('should respond with a warning if a keywords are incorrectly formatted', async function() {
        const fakeMsg = TestHelper.getFakeMessage();
        fakeMsg.content = `!tb kw ${TALLY_NAME} ${KEYWORD},,`;
        await keyword(fakeMsg as any);
        expect(fakeMsg.channel.send.getCall(0).lastArg.description).contains('cannot be empty'); 
    });

    it('should respond with a warning if tally already exists', async function() {
        const fakeMsg = TestHelper.getFakeMessage();
        fakeMsg.content = `!tb kw ${TALLY_NAME} ${KEYWORD}`;
        await db.createCmdTally(fakeMsg.getChannelId(), fakeMsg.getGuildId(), false, TALLY_NAME, '');
        await keyword(fakeMsg as any);
        expect(fakeMsg.channel.send.getCall(0).lastArg.description).contains('already exists'); 
    });
});