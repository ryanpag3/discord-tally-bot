import DataHandler from '../../../message/command/data-handler';
import TestHelper from '../../test-helper';

describe('data-handler.ts', function() {
    let message = TestHelper.getFakeMessage();

    it('should do stuff', async function() {
        message.content = `!tb data -export tallies,timers,announcements`;
        await DataHandler.runExport(message as any);
    })
});