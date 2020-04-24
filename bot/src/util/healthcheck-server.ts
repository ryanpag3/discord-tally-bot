import http from 'http';
import logger from './logger';
import { Client, Status } from 'discord.js';
import BotStatus from '../static/BotStatus';

export default class HealthCheckServer {
    private server: http.Server;
    private client: Client;

    constructor(botClient: Client) {
        this.server = http.createServer((req, res) => {
            const status: Status = this.getStatus();
            if (status !== BotStatus.READY) {
                res.writeHead(500);
            } else {
                res.writeHead(200);
            }
            res.end();
        });
        this.client = botClient;
    }

    public start() {
        if (!this.server) throw new Error('healthcheck server was not properly setup.');
        this.server.listen(4200, () => {
            logger.info('healthcheck server started on port 4200');
        });
    }

    private getStatus(): Status {
        if (!this.client) throw new Error('could not find bot client to get status from');
        return this.client.status;
    }
}