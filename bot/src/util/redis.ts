import redis from 'redis';
import { promisify } from 'util';
import logger from './logger';

export default class Redis {
    static client = redis.createClient({
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    });

    static async get(key: string) {
        const asyncGet = promisify(Redis.client.get).bind(Redis.client);
        return await asyncGet(key);
    }

    static async set(key: string, val: string) {
        const asyncSet = promisify(Redis.client.set).bind(Redis.client);
        return await asyncSet(key, val);
    }
}