import { expect } from 'chai';
import TestHelper from "../../test-helper";
import AnnounceHandler from '../../../message/command/announce-handler';
import DB from '../../../util/db';

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
        fakeMsg.content = `!tb announce -create ${ANNOUNCE_NAME} ${ANNOUNCE_DESC}`;
        await AnnounceHandler.runCreateAnnouncement(fakeMsg as any);
        const a = await db.getAnnouncement(fakeMsg.getChannelId(), ANNOUNCE_NAME);
        expect(a).to.not.be.null;
    });

    it('should set a tally goal for an announcement', async function() {
        const tallyGoal = 100;
        const command = `!tb announce -goal ${ANNOUNCE_NAME} -t ${TALLY_NAME} ${tallyGoal}`;
        const msg = TestHelper.getFakeMessage(command);
        const a = await db.createAnnouncement(msg.getChannelId(), ANNOUNCE_NAME, '');
        await db.createCmdTally(msg.getChannelId(), msg.getGuildId(), false, TALLY_NAME, '');
        await AnnounceHandler.runSetAnnouncementGoal(msg as any);
        await a.reload();
        expect(a.tallyGoal).eqls(tallyGoal);
    })

    it('should set a date as cron for an announcement', async function() {
        const command = `!tb announce -goal ${ANNOUNCE_NAME} -d ${DATE_CRON}`;
        const msg = TestHelper.getFakeMessage(command);
        const a = await db.createAnnouncement(msg.getChannelId(), ANNOUNCE_NAME, '');
        await AnnounceHandler.runSetAnnouncementGoal(msg as any);
        await a.reload();
        expect(a.datePattern).eqls(DATE_CRON);
    })

    it('should set a date as js date for an announcement', async function() {
        const command = `!tb announce -goal ${ANNOUNCE_NAME} -d ${DATE}`;
        const msg = TestHelper.getFakeMessage(command);
        const a = await db.createAnnouncement(msg.getChannelId(), ANNOUNCE_NAME, '');
        await AnnounceHandler.runSetAnnouncementGoal(msg as any);
        await a.reload();
        expect(a.datePattern).eqls(DATE);
    })

    it('should delete an announcement', async function() {
        const command = `!tb announce -delete ${ANNOUNCE_NAME}`;
        const msg = TestHelper.getFakeMessage(command);
        await db.createAnnouncement(msg.getChannelId(), ANNOUNCE_NAME, '');
        await AnnounceHandler.runDeleteAnnouncement(msg as any);
        const notHere = await db.getAnnouncement(msg.getChannelId(), ANNOUNCE_NAME);
        expect(notHere).is.null;
    })

    it('should stop announcement', async function() {
        const command = `!tb announce -disable ${ANNOUNCE_NAME} `;
        const msg = TestHelper.getFakeMessage(command);
        await db.createAnnouncement(msg.getChannelId(), ANNOUNCE_NAME, '');
        await AnnounceHandler.runDisableAnnouncement(msg as any);
        expect(msg.getLastChannelCall()).contains('has been disabled');
    });

    it('should activate an announcement', async function() {
        const command = `!tb announce -enable ${ANNOUNCE_NAME} `;
        const msg = TestHelper.getFakeMessage(command);
        const ann = await db.createAnnouncement(msg.getChannelId(), ANNOUNCE_NAME, '');
        await AnnounceHandler.runEnableAnnouncement(msg as any);
        await ann.reload();
        expect(msg.getLastChannelCall()).contains('has been enabled');
        expect(ann.active).to.be.true;
    });

    it('should create a tally alert announcement', async function() {
        const datePattern = `* * * * *`;
        const tallyName = 'test';
        const command = `!tb announce -alert ${ANNOUNCE_NAME} ${tallyName} ${datePattern}`;
        const msg = TestHelper.getFakeMessage(command);
        await AnnounceHandler.runCreateAlertAnnouncement(msg as any);
        const announcement = await db.getAnnouncement(msg.getChannelId(), ANNOUNCE_NAME);
        expect(announcement).to.exist;
    });

    it ('should alert when an announcement already exists', async function() {
        const datePattern = `* * * * *`;
        const tallyName = 'test';
        const command = `!tb announce -alert ${ANNOUNCE_NAME} ${tallyName} ${datePattern}`;
        const msg = TestHelper.getFakeMessage(command);
        const ann = await db.createAnnouncement(msg.getChannelId(), ANNOUNCE_NAME, '');
        await AnnounceHandler.runCreateAlertAnnouncement(msg as any);
        expect(msg.getLastChannelCall().toLowerCase()).to.include('already exists'); 
    });
});