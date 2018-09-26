import { Message } from "discord.js";

export default (message: Message) => {
    console.log('Running test command for channel [' + message.channel.id + ']');
    message.channel.send('This is a test command. Major tom to ground control?');
}