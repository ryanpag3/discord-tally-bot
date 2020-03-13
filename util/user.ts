import DB from './db';
import logger from './logger';

export default class UserUtil {
    static db: DB = new DB();

    // static async initAll(users: any) {
    //     const promises = [];
    //     users.forEach(user => {
    //         promises.push(UserUtil.init(user.id, user.tag));
    //     });
    //     await Promise.all(promises);
    //     // TODO: deactivate the rest?
    // }

    static async init(id: string, tag: string) {
        try {
            const user = await UserUtil.db.getUser(id);
            if (user && user.tag != tag) {
                user.tag = tag;
                await user.save();
                return;
            } else if (user) {
                return;
            }
            await UserUtil.db.createUser(id, tag);
            logger.info(`initialized new user with id ${id} and tag ${tag}`);
        } catch (e) {
            logger.error(e);
        }
    }
}
