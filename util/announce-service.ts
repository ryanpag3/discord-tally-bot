import config from '../config.json';

const env = process.env.NODE_ENV || 'development';
const devEnv = env === 'development';

export default class AnnounceService {
    static async start() {
        setInterval(async () => await AnnounceService.run(), devEnv ? config.announce_check_interval_dev : config.announce_check_interval)
    }

    static async run() {
        console.log('running');
    }

}