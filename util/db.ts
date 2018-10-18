import Sequelize from 'sequelize';
import mysql from 'mysql';
import * as counter from './counter';
import pConfig from '../config-private.json';
import config from '../config.json';
import Tally from '../models/tally';
import Timer from '../models/timer';

const sequelize = new Sequelize({
    database: config.database.name,
    username: pConfig.database.user,
    password: pConfig.database.password,
    dialect: config.database.dialect,
    operatorsAliases: false,
    logging: false
});

const conn = mysql.createConnection({
    host: pConfig.database.url,
    user: pConfig.database.user,
    password: pConfig.database.password
});

const BUMP_COUNTER = 'BUMP_COUNTER';
const DUMP_COUNTER = 'DUMP_COUNTER';
const INTERNAL = 'INTERNAL';

export default {
    Tally: sequelize.import('tally', Tally),
    Timer: sequelize.import('timer', Timer),
    init() {
        conn.connect((err) => {
            if (err) throw err;
            conn.query('CREATE DATABASE IF NOT EXISTS ' + config.database.name, (err, result) => {
                if (err) throw err;
                if (result.warningCount != 1)
                    console.log('Database ' + config.database.name + ' has been created.');
                
                this.Tally.sync();
                this.Timer.sync();
                counter.init();
            });
        });
    },

    async getTallyCount() {
        return this.Tally.findAll({ where: {}})
            .then((tallies) => tallies.length);
    },

    async createBumpCounter() {
        try {
            await this.Tally.create({
                name: BUMP_COUNTER,
                channelId: INTERNAL,
                description: 'Internal tally for bumps.',
                count: 0
            });
            console.log('Created internal bump counter.');
        } catch (e) {
            // Throws error if it already exists, which most times it will.
            // console.log(`Error while creating bump counter. ${e}`);
        }
    },

    async increaseBumpCounter() {
        try {
            let bumpTally = await this.Tally.find({ where: {name: BUMP_COUNTER, channelId: INTERNAL }});
            bumpTally.count++;
            await bumpTally.save();
        } catch (e) {
            console.log(e);
        }
    },

    async createDumpCounter() {
        try {
            await this.Tally.create({
                name: DUMP_COUNTER,
                channelId: INTERNAL,
                description: 'Internal tally for dumps.',
                count: 0
            });
        } catch (e) {
            // Throws error if it already exists, which most times it will.
            // console.log(`Error while creating dump counter. ${e}`); 
        }
    },

    async increaseDumpCounter() {
        try {
            let dumpTally = await this.Tally.find({ where: {name: DUMP_COUNTER, channelId: INTERNAL }});
            dumpTally.count++;
            await dumpTally.save();
        } catch (e) {
            console.log(e);
        } 
    },

    async getCount(name: string, channelId: string) {
        try {
            let tally = await this.Tally.find({where: {name: name, channelId: channelId}});
            return tally.count;
        } catch (e) {
            console.log(`Error while getting count for ${name}: ${e}`);
        }
    },

    async getDumpCount() {
       try {
           return await this.getCount(DUMP_COUNTER, INTERNAL);
       } catch (e) {
           console.log(`Error while getting dump count ${e}`);
       }
    },

    async getBumpCount() {
        try {
            return await this.getCount(BUMP_COUNTER, INTERNAL);
        } catch (e) {
            console.log('Error while getting bump count: ' + e);
        }
    },

    async createTimer(name: string, description: string) {
        try {
            
        } catch (e) {

        }
    }
}