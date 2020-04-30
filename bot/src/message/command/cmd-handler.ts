import { Message, Client, Permissions } from "discord.js";
import CmdHelper from '../msg-helper';
import logger from "../../util/logger";

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

    static async runPing(message: Message) {
        const createdAt = new Date(message.createdAt).getTime();
        const nowMillis = Date.now();
        const diff = nowMillis - createdAt;
        const richEmbed = CmdHelper.getRichEmbed(message.author.username)
            .setTitle(`:black_circle: Pong!`)
            .setDescription(`Response time: ${diff}`);
        await message.channel.send(richEmbed);
        CmdHelper.finalize(message);
    }
}