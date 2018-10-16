import { Message } from "discord.js";
import helper from '../util/cmd-helper';

export default (message: Message) => {
    console.log('Running test command for channel [' + message.channel.id + ']');

    helper.finalize(message);

    message.channel.send('This is a test command. Major tom to ground control?');
}