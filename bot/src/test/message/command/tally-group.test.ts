import { expect } from 'chai';
import TestHelper from '../../test-helper';
import TallyGroupHandler from '../../../message/command/tally-group';
import DB from '../../../util/db';
import logger from '../../../util/logger';
import { Test } from 'mocha';

describe('tally group commands', function () {
    const db = new DB();
    const { Tally, TallyGroup } = db;

    before(async () => {
        await db.initDatabase();
    });

    afterEach(async () => {
        await db.truncateTables();
    });

    after(async () => {
        await db.dropDatabase();
    });

    it('should create a tally-group for valid existing tallies', async function () {
        let fakeMessage = TestHelper.getFakeMessage();
        const groupName = 'test';
        const tallyNames = ['a', 'b', 'c', 'd'];
        fakeMessage.content = `!tb tg-add ${groupName} ${tallyNames.join(',')}`;
        await generateTallies(fakeMessage, tallyNames);
        await TallyGroupHandler.create(fakeMessage as any);
        const group = await TallyGroup.findOne({
            where: {
                serverId: fakeMessage.guild.id,
                channelId: fakeMessage.channel.id,
                name: groupName,
            },
        });
        expect(group).not.to.be.null;
    });

    it('should raise an exception with invalid tallies', async function() {
        let fakeMessage = TestHelper.getFakeMessage();
        const groupName = 'invalid';
        const tallyNames = ['idontexist'];
        fakeMessage.content = `!tb tg-add ${groupName} ${tallyNames.join(',')}`;
        await TallyGroupHandler.create(fakeMessage as any);
        expect(fakeMessage.getLastChannelCall().toLowerCase()).to.include('invalid tally');
    });

    it('should delete a valid tally group', async function() {
        let fakeMsg = TestHelper.getFakeMessage();
        const name = 'group';
        const tallyNames = ['a'];
        fakeMsg.content = `!tb tg-add ${name} ${tallyNames.join(',')}`;
        await generateTallies(fakeMsg, tallyNames);
        await TallyGroupHandler.create(fakeMsg as any);
        fakeMsg = TestHelper.getFakeMessage();
        fakeMsg.content = `!tb tg-rm ${name}`;
        await TallyGroupHandler.remove(fakeMsg as any);
        expect(fakeMsg.getLastChannelCall().toLowerCase()).to.include('has been deleted');
    });

    it('should raise an error if tally group does not exist to delete', async function() {
        let fakeMsg = TestHelper.getFakeMessage();
        const name = 'idontexist';
        fakeMsg.content = `!tb tg-rm ${name}`;
        await TallyGroupHandler.remove(fakeMsg as any);
        expect(fakeMsg.getLastChannelCall().toLowerCase()).to.include('could not find tally group');
    });

    async function generateTallies(fakeMessage: any, tallyNames: string[]) {
        for (const name of tallyNames) {
            await Tally.create({
                isGlobal: false,
                serverId: fakeMessage.guild.id,
                channelId: fakeMessage.channel.id,
                name,
            });
        }
    }
});
