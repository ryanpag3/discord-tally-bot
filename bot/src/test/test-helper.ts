import sinon from 'sinon';

export default class TestHelper {
    static DB_NAME = 'tallybot_automatedtest_db';
    static TALLY_BOT_DB = 'TALLY_BOT_DB';

    static getFakeMessage(content?: string) {
        let message = {
            channel: {
                id: '1',
                send: sinon.fake(),
                startTyping: () => {},
                stopTyping: () => {}
            },
            guild: {
                id: '1'
            },
            author: {
                tag: 'Ryan Page'
            },
            delete: sinon.fake(),
            content: content || null,
            getLastChannelCall: null,
            getChannelId: null,
            getGuildId: null
        };

        message['getLastChannelCall'] = (field: string) => {
            if (!field) return JSON.stringify(message.channel.send.getCall(0).lastArg);
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

    static getFakeBot() {
        let bot = {
            channels: [
                {
                    id: '1',
                    send: sinon.fake()
                }
            ],
            getLastCall: (field?: string) => {
                if (!field) return JSON.stringify(bot.channels[0].send.getCall(0).lastArg);
                return bot.channels[0].send.getCall(0).lastArg[field];
            }
        }

        return bot;
    }

    static exportDBEnvironmentVar() {
        process.env[this.TALLY_BOT_DB] = this.DB_NAME;
    }

    static resetDBEnvVar() {
        delete process.env[this.TALLY_BOT_DB];
    }
}