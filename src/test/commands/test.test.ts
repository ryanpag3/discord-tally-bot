import { expect } from 'chai';
import TestHelper from "../test-helper";
import test from '../../commands/test';

describe('test command', function() {
    it('should respond with a test message', async function() {
        const command = `!tb test`;
        const fakeMessage = TestHelper.getFakeMessage();
        fakeMessage['content'] = command;
        await test(fakeMessage as any);
        expect(fakeMessage.getLastChannelCall()).is.not.null;
    });
});