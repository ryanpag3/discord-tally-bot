import { expect } from 'chai';
import TestHelper from "../test-helper";
import announce from '../../commands/announce';
import DB from '../../util/db';

describe('announce command', function() {
    const db = new DB();
    const ANNOUNCE_NAME = 'test-announce';
    const ANNOUNCE_DESC = 'for when i want to announce something';
    const TALLY_NAME = 'tally';
    const DATE_CRON = '* * * * *';
    const DATE = '2042-04-20';

    before(async () => {
        await db.initDatabase();
    })

    beforeEach(async () => {

    });

    afterEach(async () => {
        await db.truncateTables();
    });

    after(async () => {
        await db.dropDatabase();
    });

    it('should create a new announcement', async function() {
        let fakeMsg = TestHelper.getFakeMessage();
        fakeMsg.content = `!tb announce ${ANNOUNCE_NAME} ${ANNOUNCE_DESC}`;
        await announce(fakeMsg as any);
        const a = await db.getAnnouncement(fakeMsg.getChannelId(), ANNOUNCE_NAME);
        expect(a).to.not.be.null;
    });

    it('should set a tally goal for an announcement', async function() {
        const tallyGoal = 100;
        const command = `!tb announce ${ANNOUNCE_NAME} -t ${TALLY_NAME} ${tallyGoal}`;
        const msg = TestHelper.getFakeMessage(command);
        const a = await db.createAnnouncement(msg.getChannelId(), ANNOUNCE_NAME, '');
        await db.createTally(msg.getChannelId(), msg.getGuildId(), false, TALLY_NAME, '');
        await announce(msg as any);
        await a.reload();
        expect(a.tallyGoal).eqls(tallyGoal);
    })

    it('should set a date as cron for an announcement', async function() {
        const command = `!tb announce ${ANNOUNCE_NAME} -d ${DATE_CRON}`;
        const msg = TestHelper.getFakeMessage(command);
        const a = await db.createAnnouncement(msg.getChannelId(), ANNOUNCE_NAME, '');
        await announce(msg as any);
        await a.reload();
        expect(a.datePattern).eqls(DATE_CRON);
    })

    it('should set a date as js date for an announcement', async function() {
        const command = `!tb announce ${ANNOUNCE_NAME} -d ${DATE}`;
        const msg = TestHelper.getFakeMessage(command);
        const a = await db.createAnnouncement(msg.getChannelId(), ANNOUNCE_NAME, '');
        await announce(msg as any);
        await a.reload();
        expect(a.datePattern).eqls(DATE);
    })

    it('should delete an announcement', async function() {
        const command = `!tb announce ${ANNOUNCE_NAME} -delete`;
        const msg = TestHelper.getFakeMessage(command);
        await db.createAnnouncement(msg.getChannelId(), ANNOUNCE_NAME, '');
        await announce(msg as any);
        const notHere = await db.getAnnouncement(msg.getChannelId(), ANNOUNCE_NAME);
        expect(notHere).is.null;
    })

    it('should stop announcement', async function() {
        const command = `!tb announce ${ANNOUNCE_NAME} -kill`;
        const msg = TestHelper.getFakeMessage(command);
        await db.createAnnouncement(msg.getChannelId(), ANNOUNCE_NAME, '');
        await announce(msg as any);
        expect(msg.getLastChannelCall()).contains('will not run anymore');
    })

    it('should activate an announcement', async function() {
        const command = `!tb announce ${ANNOUNCE_NAME} -activate`;
        const msg = TestHelper.getFakeMessage(command);
        const ann = await db.createAnnouncement(msg.getChannelId(), ANNOUNCE_NAME, '');
        await announce(msg as any);
        await ann.reload();
        expect(msg.getLastChannelCall()).contains('will start running again');
        expect(ann.active).to.be.true;
    })
});