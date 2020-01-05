import helper from '../util/cmd-helper';
import pConfig from '../config-private';
import logger from '../util/logger';

export default async (params) => {
    const message = params.message;
    const author = params.message.author;
    let msg = message.content.split(' ');
    msg.shift(); // prefix
    msg.shift(); // command
    const suggestion = msg.join(' ');
    const bot = params.bot;

    logger.info('Suggesting feature for user [' + author.tag + ']');

    helper.finalize(message);

    let channelId = process.env.NODE_ENV == 'production' ? pConfig.channels.suggestions : pConfig.test.channels.suggestions;
    
    if (params.channelId && process.env.NODE_ENV != 'production') {
        channelId = params.channelId;
    }
    
    const Channel = await bot.channels.find(x => x.id === channelId);

    const richEmbed = {
        description: `
**${new Date().toLocaleDateString()} | ${new Date().toLocaleTimeString()}**
suggested by **${author.tag}**

        _${suggestion}_`
    }

    Channel.send(helper.buildRichMsg(richEmbed));
    message.channel.send(`Suggestion has been sent.`);
}