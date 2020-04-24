import Discord, { Client, Channel } from 'discord.js';
import logger from './logger';

export default class AlertBot {
    private token;
    private client: Client = new Discord.Client();

    constructor(token: string) {
        this.token = token;
    }

    public async login() {
        await this.client.login(this.token);
    }

    public async sendAlert(alertMsg: string) {
        if (!process.env.ALERT_CHANNEL) throw new Error('Cannot send alert without valid alert channel defined!');
        const channel: any = this.client.channels.find(ch => ch.id === process.env.ALERT_CHANNEL);
        channel.send(alertMsg);
    }

}