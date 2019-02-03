import {
    Message
} from "discord.js";
import helper from '../util/cmd-helper';
import DB from '../util/db';

export default (message: Message) => {
    const msg = message.content.split(' ');
    const subArg = msg[2];
    try {
        if (subArg == '-on') {
            enable();
        } else if (subArg == '-off') {
            disable();
        }
        const richEmbed = {
            description: `Update alert settings saved.`
        }
        helper.finalize(message);
        message.channel.send(helper.buildRichMsg(richEmbed));
    } catch (e) {

    }

    async function enable() {
        console.log(`Enabling patch announcements for ${message.channel.id}`);
        const server: any = await DB.Server.findOne({
            where: {
                id: message.guild.id
            }
        });
        if (!server) return;
        server.patchNotesEnables = true;
        await server.save();
    }

    async function disable() {
        console.log(`Disabling patch announcements for ${message.channel.id}`);
        const server: any = await DB.Server.findOne({
            where: {
                id: message.guild.id
            }
        });
        if (!server) return;
        server.patchNotesEnables = false;
        await server.save();
    }
}