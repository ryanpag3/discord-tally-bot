import sinon from 'sinon';
import { expect } from 'chai';
import CommandHandler from '../util/command-handler';
import DB from '../util/db';
import Bluebird = require('bluebird');
import Counter from '../util/counter';

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
    })

    beforeEach(async () => {
        await Counter.init();
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

    afterEach(async () => {
        await db.truncateTables();
    });

    after(async () => {
        await db.dropDatabase();
        delete process.env.TALLY_BOT_DB;
    });

    it('should increase tally count when command is run against valid tally', async function() {
        await db.createTally(channelId, serverId, false, TALLY_NAME, '');
        const command = `!tb bump`;
        fakeMessage.content = command + ' ' + TALLY_NAME;
        commandHandler.emit(command, fakeMessage);
        await Bluebird.delay(15);
        const tally = await db.getTally(channelId, serverId, false, TALLY_NAME);
        expect(tally.count).eqls(1);
    });

    it('should respond with a warning if tally doesnt exist', async function() {
        const command = `!tb bump`;
        fakeMessage.content = command + ' ' + TALLY_NAME;
        commandHandler.emit(command, fakeMessage);
        await Bluebird.delay(15);
        expect(fakeMessage.channel.send.getCall(0).lastArg.description).contains('I couldn\'t find it'); 
    });

    it('should increase the total bump counter', async function() {
        await db.createTally(channelId, serverId, false, TALLY_NAME, '');
        const command = `!tb bump`;
        fakeMessage.content = command + ' ' + TALLY_NAME;
        const count = await Counter.getBumpCount();
        commandHandler.emit(command, fakeMessage);
        await Bluebird.delay(15);
        const tally = await db.getTally(channelId, serverId, false, TALLY_NAME);
        expect(tally.count).eqls(1);
        const newCount = await Counter.getBumpCount();
        expect(count).to.be.lessThan(newCount);
    });
});