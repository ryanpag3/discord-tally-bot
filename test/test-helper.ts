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
            delete: sinon.fake(),
            getLastChannelCall: null,
            getChannelId: null,
            getGuildId: null
        };

        message['getLastChannelCall'] = (field: string) => {
            if (!field) throw new Error('field required');
            return message.channel.send.getCall(0).lastArg[field];
        }

        message['getChannelId'] = () => {
            return message.channel.id;
        }

        message['getGuildId'] = () => {
            return message.guild.id;
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