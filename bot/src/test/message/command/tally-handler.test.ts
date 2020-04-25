import { expect } from 'chai';
import DB from '../../../util/db';
import TestHelper from '../../test-helper';
import TallyHandler from '../../../message/command/tally-handler';
import Counter from '../../../util/counter';

describe('tally-handler.ts', function() {
    TestHelper.exportDBEnvironmentVar();
    const db = new DB();
    let channelId;
    let serverId;

    before(async () => {
        await db.initDatabase();
    });

    beforeEach(async () => {
        await Counter.init();
        const fakeMessage =  TestHelper.getFakeMessage();
        channelId = fakeMessage.channel.id;
        serverId = fakeMessage.guild.id;
    });

    afterEach(async () => {
        await db.truncateTables();
    })

    after(async () => {
        await db.dropDatabase();
        TestHelper.resetDBEnvVar();
    });

    it('should enable tally reactions', async function() {  
        await db.initServer(serverId);
        const server = await db.getServer(serverId);
        let fakeMessage = TestHelper.getFakeMessage();
        fakeMessage.content = '!tb tally-reactions true';
        await TallyHandler.runSetTallyReactionsEnabled(fakeMessage as any);
        await server.reload();
        expect(server.tallyReactionsEnabled).to.be.true;
    })

    it('should disable tally reactions', async function() {  
        await db.initServer(serverId);
        const server = await db.getServer(serverId);
        server.tallyReactionsEnabled = true;
        await server.reload();
        let fakeMessage = TestHelper.getFakeMessage();
        fakeMessage.content = '!tb tally-reactions false';
        await TallyHandler.runSetTallyReactionsEnabled(fakeMessage as any);
        await server.reload();
        expect(server.tallyReactionsEnabled).to.be.false;
    })

    it('should raise an exception if tally does not exist', async function() {  
        try {
            let fakeMessage = TestHelper.getFakeMessage();
            fakeMessage.content = '!tb tally-reactions true';
            await TallyHandler.runSetTallyReactionsEnabled(fakeMessage as any);
            expect(true).to.be.false;
        } catch (e) {
            expect(e).to.exist;
        }
    })

    it('should raise an exception if user does not provide an argument', async function() {  
        try {
            let fakeMessage = TestHelper.getFakeMessage();
            fakeMessage.content = '!tb tally-reactions';
            await TallyHandler.runSetTallyReactionsEnabled(fakeMessage as any);
            expect(true).to.be.false;
        } catch (e) {
            expect(e).to.exist;
        }
    })

    it('should raise an exception if user provides invalid input', async function() {  
        try {
            let fakeMessage = TestHelper.getFakeMessage();
            fakeMessage.content = '!tb tally-reactions invalid';
            await TallyHandler.runSetTallyReactionsEnabled(fakeMessage as any);
            expect(true).to.be.false;
        } catch (e) {
            expect(e).to.exist;
        }
    })
})