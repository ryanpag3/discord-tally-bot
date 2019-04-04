import { Message } from "discord.js";
import db from './db';

export default {
    bumpKeywordTallies: async (message: Message) => {
        // todo wildcards
        // TODO: add support for global tally triggers
        const keywords = await db.getKeywords(message.channel.id);
        keywords.map(commaSeparated => {
            if (commaSeparated == null) return;
            const arr = commaSeparated.split(',');
            arr.map(keyword => {
                if(message.content.includes(keyword)) {
                    console.log(`bumping **${keyword}** tally`);
                    db.bumpKeywordTally(message.channel.id, commaSeparated);
                }
            });
        });
    }
}