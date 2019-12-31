import { Message } from "discord.js";
import DB from "../util/db";


export default class AnnounceHandler {
    db = new DB();


    constructor(message: Message) {
        // TODO:
    }

    unmarshallMsg(message: Message) {
        
    }

    async runAnnounce() {
        // TODO:
    }

    async createAnnouncement() {
        // TODO:
    }

    async deleteAnnouncement() {
        // TODO:
    }

    async setTallyGoal() {
        // TODO:
    }

    async setDateGoal() {
        // TODO:
    }

    async activateAnnouncement() {
        // TODO:
    }

    async killAnnouncement() {
        // TODO:
    }

}