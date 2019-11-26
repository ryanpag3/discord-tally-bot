import { expect } from 'chai';
import TestHelper from '../test-helper';
import DB from '../../util/db';
import Counter from '../../util/counter';
import patchnotes from '../../commands/patchnotes';

describe('patchnotes command', function() {
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

    it('should set a servers patchnotes to off', async function() {
        const fakeMsg = TestHelper.getFakeMessage();
        fakeMsg.content = `!tb patchnotes -off`;
        await db.initServer(fakeMsg.getGuildId());
        await patchnotes(fakeMsg as any);
        const server = await db.Server.findOne({ where: { id: fakeMsg.getGuildId() }});
        expect(server.patchNotesEnabled).to.be.false;
    });

    it('should set a servers patchnotes to on', async function() {
        const fakeMsg = TestHelper.getFakeMessage();
        fakeMsg.content = `!tb patchnotes -off`;
        await db.initServer(fakeMsg.getGuildId());
        await patchnotes(fakeMsg as any);
        const server = await db.Server.findOne({ where: { id: fakeMsg.getGuildId() }});
        expect(server.patchNotesEnabled).to.be.false;
        fakeMsg.content = `!tb patchnotes -on`;
        await patchnotes(fakeMsg as any);
        await server.reload();
        expect(server.patchNotesEnabled).to.be.true;
    });

    // it('should respond with a warning if a tally name isnt provided', async function() {
    //     const fakeMsg = TestHelper.getFakeMessage();
    //     fakeMsg.content = `!tb kw`;
    //     await patchnotes(fakeMsg as any);
    //     expect(fakeMsg.channel.send.getCall(0).lastArg.description).contains('name must be provided'); 
    // });

    // it('should respond with a warning if a tally keyword isnt provided', async function() {
    //     const fakeMsg = TestHelper.getFakeMessage();
    //     fakeMsg.content = `!tb kw ${TALLY_NAME}`;
    //     await patchnotes(fakeMsg as any);
    //     expect(fakeMsg.channel.send.getCall(0).lastArg.description).contains('keyword must be provided'); 
    // });

    // it('should respond with a warning if a keywords are incorrectly formatted', async function() {
    //     const fakeMsg = TestHelper.getFakeMessage();
    //     fakeMsg.content = `!tb kw ${TALLY_NAME} ${KEYWORD},,`;
    //     await patchnotes(fakeMsg as any);
    //     expect(fakeMsg.channel.send.getCall(0).lastArg.description).contains('cannot be empty'); 
    // });

    // it('should respond with a warning if tally already exists', async function() {
    //     const fakeMsg = TestHelper.getFakeMessage();
    //     fakeMsg.content = `!tb kw ${TALLY_NAME} ${KEYWORD}`;
    //     await db.createTally(fakeMsg.getChannelId(), fakeMsg.getGuildId(), false, TALLY_NAME, '');
    //     await patchnotes(fakeMsg as any);
    //     expect(fakeMsg.channel.send.getCall(0).lastArg.description).contains('already exists'); 
    // });
});