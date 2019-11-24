import sinon from 'sinon';
import { expect } from 'chai';
import CommandHandler from '../util/command-handler';
import DB from '../util/db';
import Bluebird = require('bluebird');

describe('bump command', function() {
    const dbName = 'tallybot_automatedtest_db';
    process.env['TALLY_BOT_DB'] = dbName;
    const db = new DB();
    const TALLY_NAME = 'test';
    const commandHandler = new CommandHandler();
    let fakeMessage;
    let channelId;
    let serverId;

    before(async () => {
        await db.initDatabase();
    });

    afterEach(async () => {
        await db.truncateTables();
    });

    after(async () => {
        await db.dropDatabase();
        delete process.env.TALLY_BOT_DB;
    });

    beforeEach(async () => {
        fakeMessage =  {
            channel: {
                id: '1',
                send: sinon.fake()
            },
            guild: {
                id: '1'
            },
            author: 'Ryan',
            delete: sinon.fake()
        };
        channelId = fakeMessage.channel.id;
        serverId = fakeMessage.guild.id;
    });

    this.afterEach(async () => {
        await db.Tally.truncate();
    });

    it('should increase tally count when command is run against valid tally', async function() {
        await db.createTally(channelId, serverId, false, TALLY_NAME, '');
        const t = await db.getTally(channelId, serverId, false, TALLY_NAME);
        const command = `!tb bump`;
        fakeMessage.content = command + ' ' + TALLY_NAME;
        commandHandler.emit(command, fakeMessage);
        await Bluebird.delay(25);
        const tally = await db.getTally(channelId, serverId, false, TALLY_NAME);
        expect(tally.count).eqls(1);
    });

});