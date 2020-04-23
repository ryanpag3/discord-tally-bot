import { ShardingManager } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

import PrivateConfig from './config-private';
import logger from './util/logger';

const manager = new ShardingManager('./bot.ts', { 
    token: PrivateConfig.token,
    totalShards: 10
});

manager.spawn();

manager.on('launch', shard => logger.info(`launched shard with id [${shard.id}]`));
