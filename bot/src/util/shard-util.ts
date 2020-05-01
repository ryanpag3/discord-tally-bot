import Redis from './redis';
import logger from './logger';

const SHARD_SERVER_COUNT = 'tallybot.shard.server.count';

const SHARD_USER_COUNT = 'tallybot.shard.user.count';

export default class ShardUtil {

    static async storeShardServerCount(shardId: number, shardServerCount: number, totalShards: number) {
        const existingCounts = JSON.parse(await Redis.get(SHARD_SERVER_COUNT)) || new Array(totalShards);
        existingCounts[shardId] = shardServerCount;
        await Redis.set(SHARD_SERVER_COUNT, JSON.stringify(existingCounts));
    }

    static async storeShardUserCount(shardId: number, shardUserCount: number, totalShards: number) {
        const existingCounts = JSON.parse(await Redis.get(SHARD_USER_COUNT)) || new Array(totalShards);
        existingCounts[shardId] = shardUserCount;
        await Redis.set(SHARD_USER_COUNT, JSON.stringify(existingCounts));
    }

    static async getTotalServers() {
        try {
            const existingCounts = JSON.parse(await Redis.get(SHARD_SERVER_COUNT));
            let total = 0;
            
            for (const count of existingCounts) {
                total += count;
            }

            return total;
        } catch (e) {
            logger.error(e);
        }
    }

    static async getTotalUsers() {
        try {
            const existingCounts = JSON.parse(await Redis.get(SHARD_USER_COUNT));
            let total = 0;
            
            for (const count of existingCounts) {
                total += count;
            }

            return total;
        } catch (e) {
            logger.error(e);
        }
    }

}