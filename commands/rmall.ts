import {
    Message
} from "discord.js";
import DB from '../util/db';
import helper from '../util/cmd-helper';

const Tally = DB.tally;

export default (message: Message) => {
    console.log('Deleting all tallies.');
    Tally.destroy({
        where: {
            channelId: message.channel.id
        }
    })
        .then((res) => {
            const successMsg = {
                title: `All tallies have been deleted.`
            };

            const failMsg = {
                title: `No tallies currently exist to delete.`
            }

            helper.finalize(message);

            if (res != 0)
                message.channel.send(helper.buildRichMsg(successMsg));
            else
                message.channel.send(helper.buildRichMsg(failMsg));
        });
}