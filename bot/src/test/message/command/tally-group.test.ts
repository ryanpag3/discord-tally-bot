import { expect } from 'chai';
import TestHelper from '../../test-helper';
import TallyGroupHandler from '../../../message/command/tally-group';
import DB from '../../../util/db';
import logger from '../../../util/logger';

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
        for (const name of tallyNames) {
            await Tally.create({
                isGlobal: false,
                serverId: fakeMessage.guild.id,
                channelId: fakeMessage.channel.id,
                name,
            });
        }
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
});
