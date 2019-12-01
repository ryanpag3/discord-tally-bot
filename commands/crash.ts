import { Message } from "discord.js";
import helper from '../util/cmd-helper';
import Env from "../util/env";

export default async (message: Message) => {

    if (Env.isProduction()) {
        console.log(`Someone tried to run !tb crash in production and they got rekt.`);
        return;
    }

    console.log('Crashing the bot...');

    return new Promise((resolve, reject) => {
        return reject(new Error(`Error that shuts the whole damn thing down!`));
    })
}