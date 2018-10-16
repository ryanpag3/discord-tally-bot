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
                        \`!tb details <name>\` - get tally details
                        \`!tb get <name>\`
                       `
            },
            {
                title: `Manage Tallies`,
                value: `
                        \`!tb create <name> <description>\` - create/add a tally
                        \`!tb add <name> <description>\`
                        \`!tb describe <name> <description>\` - update tally description
                        \`!tb update <name> <description>\`
                        \`!tb delete <name>\` - delete/rm tally
                        \`!tb rm <name>\`
                        \`!tb bump <name>\` - increase tally by one point
                        \`!tb bump <name> <amount>\` - increase tally by specified amount
                        \`!tb dump <name>\` - decrease tally by one point
                        \`!tb dump <name> <amount>\` - decrease a tally by a specified amount
                        \`!tb set <name> <value>\` - set tally to amount
                        \`!tb empty <name>\` - set tally to 0

                        help called by **${message.author.tag}**
                       `
            }
        ]
    }

    helper.finalize(message);

    message.channel.send(helper.buildRichMsg(msg));
}