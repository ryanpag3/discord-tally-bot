import helper from '../util/cmd-helper';
import pConfig from '../config-private';

export default async (params) => {
    const message = params.message;
    const author = params.message.author;
    let msg = message.content.split(' ');
    msg.shift(); // prefix
    msg.shift(); // command
    const bugReport = msg.join(' ');
    const bot = params.bot;

    console.log('Reporting bug for user [' + author.toString() + '] to ');

    helper.finalize(message);

    let channelId = process.env.NODE_ENV == 'production' ? pConfig.channels.bugs : pConfig.test.channels.bugs;
    
    if (params.channelId && process.env.NODE_ENV != 'production') {
        channelId = params.channelId;
    }

    const Channel = await bot.channels.find(x => x.id === channelId);

    const richEmbed = {
        description: `**${new Date().toLocaleDateString()} | ${new Date().toLocaleTimeString()}**
        reported by by **${author.toString()}**
        \n_${bugReport}_`
    }

    Channel.send(helper.buildRichMsg(richEmbed));
    message.channel.send(`Bug report has been sent.`);
}