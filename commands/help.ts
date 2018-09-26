import { Message } from "discord.js";

export default (message: Message) => {
    console.log('Running help command for channel [' + message.channel.id + ']');
    message.channel.send('For a list of up-to-date commands, please check out the README at https://github.com/ryanpage42/discord-tally-bot');
}