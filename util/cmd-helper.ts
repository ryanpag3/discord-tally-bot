import Discord from 'discord.js';

export default {
    removePrefixCommand: (messageContent: string, commandLength) => {
        let msgArr = messageContent.split(' ');
        for (let i = 0; i < commandLength; i++) {
            msgArr.shift();
        }
        return msgArr.join(' ');
    },

    /**
     * build a rich embed message object
     * sample msg object
     *     const msg = {
                title: `_Tally Bot Command Reference_`,
                description: `For full documentation, please refer to https://github.com/ryanpage42/discord-tally-bot`,
                color: `#42f486`,
                fields: [
                    {
                       title: `Basic Utilities`,
                        value: `\`!tb help\` - show this dialog
                                \`!tb show\` - show all current tallies
                       `
                    },
                    {
                        title: `Manage Tallies`,
                        value: `
                                \`!tb create <name> <description>\`
                                \`!tb add <name> <description>\`
                                \`!tb delete <name>\`
                                \`!tb rm <name>\`
                                \`!tb bump <name>\`
                                \`!tb dump <name>\`
                                \`!tb set <name> <value>\`
                                \`!tb empty <name>\`
                               `
                    }
                ]
            }
     */
    buildRichMsg: (msg: any) => {
        const embed = new Discord.RichEmbed()
            .setTitle(msg.title || '')
            .setDescription(msg.description || '')
            .setColor(msg.color || '#5fcca4');
        
        if (!msg.fields)
            return embed;
        
        for (let field of msg.fields) {
            embed.addField(field.title, field.value || '-');
        }

        return embed;
    },

    /**
     * this is used as a backup for rich embed
     */
    buildPlainMsg: (msg: any) => {
        // todo
    },

    getRandomPhrase: (phrases: Array<string>) => {
        const rand = Math.floor(Math.random() * phrases.length);
        return phrases[rand];
    },

    /**
     * run any finalization logic for the particular message
     */
    finalize: async (msg: any) => {
        deleteCommandMsg(msg);
    },

    truncate(string, len){
        if (string.length > len)
           return string.substring(0,len)+'...';
        else
           return string;
     },

     /**
      * TODO: Error handling
      * return page based on pagination parameters
      * @param pageSize - how many results per page
      * @param pageNum - which page
      * @param collection - collection to paginate
      */
     handlePagination(pageSize: number, pageNum: number, collection: Array<any>) {
        pageNum == 0 ? pageNum = 1 : pageNum--;
        const startIndex = pageSize * pageNum;
        const endIndex = startIndex + pageSize;
        return collection.slice(startIndex, endIndex);
     }
}

/**
 * private functions
 */
const deleteCommandMsg = async (msg: any) => {
    try {
        await msg.delete()
    } catch (e) {
        if (e.toString().indexOf('Missing Permissions') == -1)
            console.log(e);
    }
}