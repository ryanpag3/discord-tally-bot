import DB from "../../util/db";

const MAX_TIMERS_REACHED = 1;
const db = new DB();

export default class TimerHandler {
    static async checkIfMaximumTimersReached(where: any) {
        if (await TimerHandler.isMaxTimersReached(where))
            throw new Error(`Cannot create timer. Max timer amount (${MAX_TIMERS_REACHED}) has been reached. This applies per channel.`)
    }

    static async isMaxTimersReached(where: any) {
        const count = await db.getTimerCount(where);
        if (count >= MAX_TIMERS_REACHED)
            return true;
        return false;
    }
}