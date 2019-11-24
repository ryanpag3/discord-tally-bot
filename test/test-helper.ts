import sinon from 'sinon';

export default class TestHelper {
    static DB_NAME = 'tallybot_automatedtest_db';
    static TALLY_BOT_DB = 'TALLY_BOT_DB';

    static getFakeMessage() {
        return {
            channel: {
                id: '1',
                send: sinon.fake()
            },
            guild: {
                id: '1'
            },
            author: 'Ryan Page',
            delete: sinon.fake()
        };
    }

    static exportDBEnvironmentVar() {
        process.env[this.TALLY_BOT_DB] = this.DB_NAME;
    }

    static resetDBEnvVar() {
        delete process.env[this.TALLY_BOT_DB];
    }
}