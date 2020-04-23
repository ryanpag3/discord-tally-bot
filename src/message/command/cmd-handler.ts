import { Message, Client, Permissions } from "discord.js";
import CmdHelper from '../../message/cmd-helper';

export default class CmdHandler {
    static async runInvite(params: any) {
        const message = params.message;
        const bot: Client = params.bot;
        const link = await bot.generateInvite([
            Permissions.FLAGS.READ_MESSAGES, 
            Permissions.FLAGS.SEND_MESSAGES, 
            Permissions.FLAGS.MANAGE_MESSAGES
        ]);
        const richEmbed = CmdHelper.getRichEmbed(message.author.username)
            .setTitle(`:email: invite`)
            .setDescription(`[Click to invite bot](${link})`);
        message.channel.send(richEmbed);
        CmdHelper.finalize(message);
    }
}