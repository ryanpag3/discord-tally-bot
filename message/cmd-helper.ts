import Discord from 'discord.js';
import config from '../config';
import logger from '../util/logger';

export default {
    removePrefixCommand: (messageContent: string, commandLength) => {
        let msgArr = messageContent.split(' ');
        for (let i = 0; i < commandLength; i++) {
            msgArr.shift();
        }
        return msgArr.join(' ');
    },

    /**
     * @deprecated Please use .getRichEmbed
     */
    buildRichMsg: (msg: any) => {
        const embed = new Discord.RichEmbed()
            .setTitle(msg.title || '')
            .setDescription(msg.description || '')
            .setColor(msg.color || '#5fcca4');
        
        if (!msg.fields)
            msg.fields = [];
        
        for (let field of msg.fields) {
            embed.addField(field.title, field.value || '-');
        }

        return embed;
    },

    getRichEmbed:(username?: string) => {
        const richEmbed = new Discord.RichEmbed()
            .setTimestamp()
            .setColor('#cf5967');
            // .setColor('#5fcca4');
        if (username)
            richEmbed.setFooter(`${username}`);
        return richEmbed;
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
        if (msg.channel.type == 'dm') return;
        // TODO: make opt-in
        // PatchAnnouncer.announcePatch(msg);
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
     },

     /**
      * parse message contents and check for global flag
      */
     isGlobalTallyMessage(message) {
        const split = message.content.split(' ');
        return split[2] === '-g';
    }
}

/**
 * private functions
 */
const deleteCommandMsg = async (msg: any) => {
    try {
        setTimeout(async () => await msg.delete(), config.delete_timeout);
    } catch (e) {
        if (e.toString().indexOf('Missing Permissions') == -1)
            logger.info(e);
    }
}