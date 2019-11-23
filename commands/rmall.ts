import {
    Message
} from "discord.js";
import DB from '../util/db';
import helper from '../util/cmd-helper';

const db = new DB();
const Tally = db.Tally;
const Timer = db.Timer;
const Announcement = db.Announcement;

export default (message: Message) => {
    console.log('Deleting all tallies.');
    Tally.destroy({
        where: {
            channelId: message.channel.id
        }
    }).then(async () => {
        return await Timer.destroy({
            where: {
                channelId: message.channel.id
            }
        })
    }).then(async () => {
        return await Announcement.destroy({
            where: {
                channelId: message.channel.id
            }
        }) 
    })
        .then((res) => {
            const successMsg = {
                title: `All tallies, timers, and announcements have been deleted.`
            };

            const failMsg = {
                title: `No tallies or timers currently exist to delete.`
            }

            helper.finalize(message);

            if (res != 0)
                message.channel.send(helper.buildRichMsg(successMsg));
            else
                message.channel.send(helper.buildRichMsg(failMsg));
        });
}