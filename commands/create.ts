import { Message } from "discord.js";

export default (message: Message) => {
    message.channel.send('This is a test command. Major tom to ground control?');
}