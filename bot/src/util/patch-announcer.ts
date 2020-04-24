import path from 'path';
import DB from './db';
import helper from '../message/cmd-helper';
import logger from './logger';

export default class PatchAnnouncer {
    constructor() {}

    static async announcePatch(msg: any) {
        try {
            const db = new DB();
            const server: any = await db.Server.findOne({
                where: {
                    id: msg.guild.id,
                    patchNotesEnabled: true
                }
            });

            if (!server) return;
            if (server.lastPatchAnnounced === PatchAnnouncer.getCurrentVersion()) return;

            PatchAnnouncer.sendPatchMsg(msg.channel);
            server.lastPatchAnnounced = PatchAnnouncer.getCurrentVersion();
            await server.save();
        } catch (e) {
            logger.info(`Could not announce patch. Reason ${e}`);
        }
    }

    static getCurrentVersion() {
        const {
            version
        } = require(path.resolve(__dirname, '../../package.json'));
        return version;
    }

    static sendPatchMsg(channel) {
        const richEmbed = {
            title: `:camera_with_flash: Tally Bot has been updated to v.${PatchAnnouncer.getCurrentVersion()}`,
            description: `See patch notes here: https://github.com/ryanpage42/discord-tally-bot/blob/master/CHANGELOG.md` +
                `\nThese alerts will only trigger once per update, per server.` +
                `\nDisable/Enable alerts with \`!tb patchnotes -off\` and \`!tb patchnotes -on\``
        }
        channel.send(helper.buildRichMsg(richEmbed));
    }
}