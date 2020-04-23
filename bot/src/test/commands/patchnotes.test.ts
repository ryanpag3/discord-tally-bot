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
});