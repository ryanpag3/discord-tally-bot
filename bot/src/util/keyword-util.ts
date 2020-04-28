import { Message } from 'discord.js';
import DB from './db';
import logger from './logger';
import Sequelize, { Op } from 'sequelize';

const db = new DB();

export default class KeywordUtil {
    static keywordGuilds: any = [];

    /**
     * Initialize all keyword guilds to cache
     */
    static async loadKeywordServersToCache() {
        const tallies = await db.Tally.findAll({
            where: {
                keyword: {
                    [Op.ne]: null,
                },
            }
        });
        const filtered = KeywordUtil.removeDuplicates(tallies, 'serverId');
        const serverIds = filtered.map(t => t.serverId);
        KeywordUtil.keywordGuilds = serverIds;
    }

    static removeDuplicates(originalArray: any[], prop: string) {
        var newArray = [];
        var lookupObject  = {};
   
        for(var i in originalArray) {
           lookupObject[originalArray[i][prop]] = originalArray[i];
        }
   
        for(i in lookupObject) {
            newArray.push(lookupObject[i]);
        }
         return newArray;
    }

    static async bumpKeywordTallies(message: Message) {
        if (!KeywordUtil.hasKeywordTally(message.guild.id)) return;
        logger.debug(`keyword tally exists for guild`);
        await KeywordUtil.bumpGlobalKeywordTallies(message);
        await KeywordUtil.bumpChannelKeywordTallies(message);
    }
 
    static async bumpGlobalKeywordTallies(message: Message) {
        const keywords = await db.getGlobalKeywords(message.guild.id);
        KeywordUtil.parseKeywordsAndHandle(message.content, keywords, message.guild.id);
    }

    static async bumpChannelKeywordTallies(message: Message) {
        const keywords = await db.getKeywords(message.channel.id, message.guild.id);
        KeywordUtil.parseKeywordsAndHandle(message.content, keywords, message.guild.id, message.channel.id);
    }

    static parseKeywordsAndHandle(messageContent: string, keywords: any[], serverId: string, channelId?: string) {
        keywords.map((commaSeparated) => {
            if (commaSeparated == null) return;
            const arr = commaSeparated.split(',');
            arr.map((keyword) => {
                if (messageContent.includes(keyword)) {
                    db.handleKeywordTally(serverId, commaSeparated, channelId);
                }
            });
        });
    }

    static hasKeywordTally(serverId: string) {
        return KeywordUtil.keywordGuilds.length !== 0 && KeywordUtil.keywordGuilds.includes(serverId);
    }

    static addServerToKeywordCache(serverId: string) {
        if (KeywordUtil.hasKeywordTally(serverId)) return;
        KeywordUtil.keywordGuilds.push(serverId);
    }
}