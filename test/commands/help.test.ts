import { expect } from 'chai';
import TestHelper from "../test-helper";
import CommandHandler from "../../util/command-handler";
import Bluebird = require("bluebird");

describe('help command', function() {
    const commandHandler = new CommandHandler();

    it('should display help', async function() {
        const command = `!tb help`;
        const fakeMessage = TestHelper.getFakeMessage();
        fakeMessage['content'] = command;
        commandHandler.emit(command, fakeMessage);
        await Bluebird.delay(10);
        expect(fakeMessage.getLastChannelCall('description')).contains('github.com');
    });
});