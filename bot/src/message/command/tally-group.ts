import { Message } from 'discord.js';
import logger from '../../util/logger';
import MsgHelper from '../msg-helper';
import DB from '../../util/db';
import { Op } from 'sequelize';

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
            tallyNames: cmd.tallies.join(','),
            description: cmd.description
        });

        MsgHelper.sendMessage(
            message, 
            MsgHelper.getRichEmbed(message.author.username)
                .setTitle(':flying_saucer: ' + cmd.command)
                .setDescription(`Run \`!tb tg-bump ${cmd.name}\` or \`!tb tg-dump ${cmd.name}\` to modify multiple tallies.`)
                .addField(`Name`, cmd.name)
                .addField(`Description`, cmd.description || `No description.`)
                .addField(`Tallies`, cmd.tallies.join(',')));
        logger.info(`Created tally group ${cmd.name} for ${message.guild.id} ${message.channel.id}`);
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
    try {
        const cmd = unmarshall(message);
        const res = await TallyGroup.destroy({
            where: {
                name: cmd.name,
                channelId: message.channel.id,
                serverId: message.guild.id
            }
        });

        if (res === 0) throw new Error(`Could not find tally group to delete.`);

        MsgHelper.sendMessage(
            message, 
            MsgHelper.getRichEmbed(message.author.username)
                .setTitle(':trash: ' + cmd.command)
                .setDescription(`Tally group **${cmd.name}** has been deleted.`));
        
        logger.info(`Deleted tally group ${cmd.name} for user ${message.author.tag}`);
    } catch (e) {
        MsgHelper.handleError(`Error occured while removing tally group.`, e, message);
    }
}

const get = async (message: Message) => {
    try {
        const msg = unmarshall(message);
        const group = await TallyGroup.findOne({
            where: {
                name: msg.name,
                channelId: message.channel.id,
                serverId: message.guild.id 
            }
        });
        if (!group) throw new Error(`Could not find tally group by name ${msg.name}`);
        const tallyNames = group.tallyNames.split(',');
        const tallies = await getTallies(message.guild.id, message.channel.id, tallyNames);
        const richEmbed = MsgHelper.getRichEmbed(message.author.username);
        richEmbed.setTitle(`:family_man_girl_boy: ${msg.command}`);
        richEmbed.addField(`Name`, msg.name);
        richEmbed.addField(`Description`, msg.description || 'No description.');
        richEmbed.addField(`Tallies`, tallies.map((t) => `name: **${t.name}** count: **${t.count}**`).join(`\n`));
        MsgHelper.sendMessage(message, richEmbed);

    } catch (e) {
        MsgHelper.handleError(`Error occured while getting tally group.`, e, message);
    }
}

const getTallies = async (serverId: string, channelId: string, tallyNames: string[]) => {
    const tallies = await Tally.findAll({
        where: {
            serverId,
            channelId,
            name: {
                [Op.or] : tallyNames
            }
        }
    });

    return tallies;
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
        tallies: split[offset + 3] ? split[offset + 3].split(',') : [],
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