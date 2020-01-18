import DB from "./db";

export default class UserUtil {
    static db: DB = new DB();

    static async init(id: string) {
        const user = await UserUtil.db.getUser(id);
        if (user) return;
        await UserUtil.db.createUser(id);
    }
}