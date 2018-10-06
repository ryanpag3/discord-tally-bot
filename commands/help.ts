import { Message } from "discord.js";
import helper from '../util/cmd-helper';

export default (message: Message) => {
    console.log('Running help command for channel [' + message.channel.id + ']');

    const msg = {
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

    message.channel.send(helper.buildRichMsg(msg));
}