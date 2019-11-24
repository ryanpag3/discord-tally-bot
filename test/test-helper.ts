import sinon from 'sinon';

export default class TestHelper {
    static DB_NAME = 'tallybot_automatedtest_db';
    static TALLY_BOT_DB = 'TALLY_BOT_DB';

    static getFakeMessage(): any {
        let message = {
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

        message['getLastChannelCall'] = (field: string) => {
            return message.channel.send.getCall(0).lastArg[field];
        }

        return message;
    }

    static exportDBEnvironmentVar() {
        process.env[this.TALLY_BOT_DB] = this.DB_NAME;
    }

    static resetDBEnvVar() {
        delete process.env[this.TALLY_BOT_DB];
    }
}