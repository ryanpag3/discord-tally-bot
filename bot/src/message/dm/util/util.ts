import { Message } from 'discord.js';
import logger from '../../../util/logger';
import MsgHelper from '../../msg-helper';

export const handleDmError = async (msg: string, e: Error, message: Message) => {
    logger.error(msg, e);
    const richEmbed = MsgHelper.getRichEmbed(message.author.username)
        .setTitle(msg)
        .setDescription(e.message);
    await message.channel.send(richEmbed);
    MsgHelper.finalize(message);
};
