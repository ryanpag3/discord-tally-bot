import { Message } from "discord.js";
import DB from './db';

const db = new DB();

export default class KeywordUtil {
    static async bumpKeywordTallies (message: Message) {
        await KeywordUtil.bumpGlobalKeywordTallies(message);
        await KeywordUtil.bumpChannelKeywordTallies(message)
    }

    static async bumpGlobalKeywordTallies (message: Message) {
        const keywords = await db.getGlobalKeywords(message.guild.id);
        KeywordUtil.parseKeywordsAndHandle(message.content, keywords, message.guild.id);
    }

    static async bumpChannelKeywordTallies (message: Message) {
        const keywords = await db.getKeywords(message.channel.id, message.guild.id);
        KeywordUtil.parseKeywordsAndHandle(message.content, keywords, message.guild.id, message.channel.id);
    }

    static parseKeywordsAndHandle(messageContent: string, keywords: any[], serverId: string, channelId?: string) {
        keywords.map(commaSeparated => {
            if (commaSeparated == null) return;
            const arr = commaSeparated.split(',');
            arr.map(keyword => {
                if(messageContent.includes(keyword)) {
                    db.handleKeywordTally(serverId, commaSeparated, channelId);
                }
            });
        });
    }
}