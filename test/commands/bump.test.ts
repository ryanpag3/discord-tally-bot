import sinon from 'sinon';
import { expect } from 'chai';
import CommandHandler from '../../util/command-handler';
import DB from '../../util/db';
import Bluebird = require('bluebird');
import Counter from '../../util/counter';
import TestHelper from '../test-helper';

describe('bump command', function() {
    TestHelper.exportDBEnvironmentVar();
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
        fakeMessage =  TestHelper.getFakeMessage();
        channelId = fakeMessage.channel.id;
        serverId = fakeMessage.guild.id;
    });

    afterEach(async () => {
        await db.truncateTables();
    });

    after(async () => {
        await db.dropDatabase();
        TestHelper.resetDBEnvVar();
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
        expect(fakeMessage.channel.send.getCall(0).lastArg.description).contains('Could not find tally'); 
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

    it('should handle a large number of bumps', async function() {
        this.timeout(15000);
        await db.createTally(channelId, serverId, false, TALLY_NAME, '');
        const command = `!tb bump`;
        fakeMessage.content = command + ' ' + TALLY_NAME;
        const count = await Counter.getBumpCount();
        const commandsAmt = 10;
        for (let i = 0; i < commandsAmt; i++) {
            commandHandler.emit(command, fakeMessage);
            await Bluebird.delay(50);
        }
        await Bluebird.delay(100);
        const tally = await db.getTally(channelId, serverId, false, TALLY_NAME);
        expect(tally.count).eqls(commandsAmt);
        const newCount = await Counter.getBumpCount();
        expect(count).to.be.lessThan(newCount);
    });
});