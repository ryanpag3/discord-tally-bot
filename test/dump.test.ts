import { expect } from 'chai';
import DB from '../util/db';
import TestHelper from './test-helper';
import CommandHandler from '../util/command-handler';
import Counter from '../util/counter';
import Bluebird = require('bluebird');

describe('dump command', function() {
    const TALLY_NAME = 'dump-tally';
    let fakeMessage;
    let channelId;
    let serverId;
    
    const db = new DB();
    const commandHandler = new CommandHandler();

    before(async () => {
        TestHelper.exportDBEnvironmentVar();
        await db.initDatabase();
    });

    beforeEach(async () => {
        await Counter.init();
        fakeMessage = TestHelper.getFakeMessage();
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

    it('should decrease tally count when command is run against valid tally', async function() {
        await db.createTally(channelId, serverId, false, TALLY_NAME, '');
        const command = `!tb dump`;
        fakeMessage.content = command + ' ' + TALLY_NAME;
        commandHandler.emit(command, fakeMessage);
        await Bluebird.delay(100);
        const tally = await db.getTally(channelId, serverId, false, TALLY_NAME);
        expect(tally.count).eqls(-1);
    });

    it('should respond with a warning if tally doesnt exist', async function() {
        const command = `!tb dump`;
        fakeMessage.content = command + ' ' + TALLY_NAME;
        commandHandler.emit(command, fakeMessage);
        await Bluebird.delay(100);
        expect(fakeMessage.channel.send.getCall(0).lastArg.description).contains('I couldn\'t find it'); 
    });

    it('should increase the total dump counter', async function() {
        await db.createTally(channelId, serverId, false, TALLY_NAME, '');
        const command = `!tb dump`;
        fakeMessage.content = command + ' ' + TALLY_NAME;
        const count = await Counter.getDumpCount();
        commandHandler.emit(command, fakeMessage);
        await Bluebird.delay(100);
        const newCount = await Counter.getDumpCount();
        expect(count).to.be.lessThan(newCount);
    });

    it('should handle a large number of dumps', async function() {
        this.timeout(15000);
        await db.createTally(channelId, serverId, false, TALLY_NAME, '');
        const command = `!tb dump`;
        fakeMessage.content = command + ' ' + TALLY_NAME;
        const count = await Counter.getDumpCount();
        const commandsAmt = 50;
        for (let i = 0; i < commandsAmt; i++) {
            commandHandler.emit(command, fakeMessage);
            await Bluebird.delay(20);
        }
        await Bluebird.delay(100);
        const tally = await db.getTally(channelId, serverId, false, TALLY_NAME);
        expect(tally.count).eqls(commandsAmt * -1);
        const newCount = await Counter.getDumpCount();
        expect(count).to.be.lessThan(newCount);
    });

});