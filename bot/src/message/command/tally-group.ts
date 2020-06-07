import { Message } from 'discord.js';
import logger from '../../util/logger';
import MsgHelper from '../msg-helper';
import DB from '../../util/db';

/**
 * !tb tg-add [group_name] [tallies] [description]
 * !tb tg-rm [group_name]
 * !tb tg-get [group_name]
 * !tb tg-edit [group_name]
 * !tb tg-show [page_number]
 * !tb tg-bump [group_name] [count]
 * !tb tg-dump [group_name] [count]
 */

 const db = new DB();
 const { Tally, TallyGroup } = db;

const create = async (message: Message) => {
    try {
        const cmd = unmarshall(message);
        if (!cmd.name) throw new Error(`Name is required to create tally group.`);
        if (!cmd.tallies || cmd.tallies.length === 0) throw new Error(`At least one tally must be assigned to tally group.`);
        if (cmd.tallies.length > 25) throw new Error(`Maximum 25 tallies can be assigned to a tally group.`);
        logger.debug(`Creating tally group ${cmd.name} for ${message.guild.id} ${message.channel.id}`);
        await checkIfValidGroupTallies(cmd.isGlobal, message.guild.id, message.channel.id, cmd.tallies);
        const group = await TallyGroup.create({
            serverId: message.guild.id,
            channelId: message.channel.id,
            name: cmd.name,
            tallies: cmd.tallies.join(','),
            description: cmd.description
        });

        MsgHelper.sendMessage(
            message, 
            MsgHelper.getRichEmbed(message.author.username)
                .setTitle(cmd.command)
                .setDescription(`Created new tally group`));

        return group;
    } catch (e) {
        MsgHelper.handleError(`Error while creating tally group.`, e, message);
    }
}

const checkIfValidGroupTallies = async (isGlobal: boolean, serverId: string, channelId: string, tallies: string[]) => {
    for (const tallyName of tallies) {
        const query = {
            isGlobal,
            serverId,
            channelId,
            name: tallyName
        };

        if (isGlobal === false) delete query.serverId;

        const t = await Tally.findOne({
            where: query
        });

        if (!t) throw new Error(`Invalid tally found for group tally definition. ${tallyName}`);
    }
}

const remove = async (message: Message) => {
    
}

const get = async (message: Message) => {

}

const edit = async (message: Message) => {

}

const show = async (message: Message) => {

}

const bump = async (message: Message) => {

}

const dump = async (message: Message) => {

}

const unmarshall = (message: Message): {
    isGlobal: boolean;
    command: string;
    name: string;
    tallies?: string[];
    description?: string;
    count?: Number;
    pageNumber?: Number;
} => {
    const split = message.content.split(' ');
    const isGlobal = split[2] === '-g';
    const offset = isGlobal ? 1 : 0;
    return {
        isGlobal,
        command: split[offset + 1],
        name: split[offset + 2],
        tallies: split[offset + 3].split(','),
        description: split[offset + 4],
        count: Number.parseInt(split[offset + 3] || '1'),
        pageNumber: Number.parseInt(split[offset + 2] || '0')
    }
}

const TallyGroupHandler = {
    create,
    remove,
    get,
    edit,
    show,
    bump,
    dump
};

export default TallyGroupHandler;