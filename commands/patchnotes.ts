import {
    Message
} from "discord.js";
import helper from '../util/cmd-helper';
import DB from '../util/db';
import logger from "../util/logger";

export default async (message: Message) => {
    const db = new DB();
    const msg = message.content.split(' ');
    const subArg = msg[2];
    try {
        if (subArg == '-on') {
            await enable();
        } else if (subArg == '-off') {
            await disable();
        }
        const richEmbed = {
            description: `Update alert settings saved.`
        }
        helper.finalize(message);
        message.channel.send(helper.buildRichMsg(richEmbed));
    } catch (e) {
        logger.info(`error while updating patchnotes settings for server ${e}`);
    }

    async function enable() {
        logger.info(`Enabling patch announcements for ${message.channel.id}`);
        const server: any = await db.Server.findOne({
            where: {
                id: message.guild.id
            }
        });
        if (!server) return;
        server.patchNotesEnabled = true;
        await server.save();
    }

    async function disable() {
        logger.info(`Disabling patch announcements for ${message.channel.id}`);
        const server: any = await db.Server.findOne({
            where: {
                id: message.guild.id
            }
        });
        if (!server) return;
        server.patchNotesEnabled = false;
        await server.save();
    }
}