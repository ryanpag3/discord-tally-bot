import { Message, Client, Permissions } from "discord.js";
import moment from 'moment';
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

    static async runMigrate(message: Message) {
        const richEmbed = CmdHelper.getRichEmbed()
            .setDescription(`This bot has reached the end of its life and I have built brand new bot to replace it.\n\n Please see the [migration guide on github](https://github.com/ryanpag3/discord-score-bot#migrating-from-tally-bot) for how to move your data to [Score Bot](https://github.com/ryanpag3/discord-score-bot). ${moment('01-01-2021').diff(moment(), 'days')} days remaining.`);
        await message.channel.send(richEmbed);
        CmdHelper.finalize(message);
    }
}