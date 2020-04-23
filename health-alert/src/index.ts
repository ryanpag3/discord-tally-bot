import dotenv from 'dotenv';
dotenv.config(); // this must be run first

import { CronJob } from 'cron';
import axios from 'axios';
import logger from './util/logger';

const healthCheckPattern = process.env.HEALTHCHECK_CRON_PATTERN || '*/5 * * * * *';
try {
    const healthCheckJob = new CronJob(
        healthCheckPattern,
        async () => {
            logger.debug('starting health check');
            const res = await axios.get('http://localhost/containers/json', {
                socketPath: '/var/run/docker.sock',
            });
            logger.info(JSON.stringify(res.data));
            logger.info('health check done');
        },
        null,
        true,
        'America/Los_Angeles'
    );

    logger.info('Houston, we have lift off. Health check service started.');
} catch (e) {
    logger.error(`Oh no, something went terribly wrong.`, e);
}
