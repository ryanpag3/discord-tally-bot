import { ShardingManager } from 'discord.js';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import PrivateConfig from './util/config-private';
import logger from './util/logger';

const manager = new ShardingManager(path.join(__dirname, './bot.ts'), { 
    token: PrivateConfig.token
});

manager.spawn();

manager.on('launch', shard => logger.info(`launched shard with id [${shard.id}]`));
