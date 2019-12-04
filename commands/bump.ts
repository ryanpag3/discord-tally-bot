import { Message } from 'discord.js';
import TallyCommon from '../commands-common/tally-common';

export default async (message: Message) => {
    return await TallyCommon.runBump(message);
}