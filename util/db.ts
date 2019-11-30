import Sequelize from 'sequelize';
import mysql from 'mysql';
import Config from '../config';
import PrivateConfig from '../config-private';
import Counter from './counter';
import Sqlize from './sqlize';

export default class DB {
    private TALLY_DESCRIPTION_MAXLEN = 255;
    mysqlPool;
    sequelize;
    dbName;

    // tables
    Tally;
    Timer;
    Announcement;
    Channel;
    Server;
    Permission;

    constructor(dbName?: string) {
        if (dbName === undefined) dbName = this.getConfiguredDB();
        this.dbName = dbName;
        this.sequelize = new Sqlize(dbName);
        this.initModels();
    }

    private getConfiguredDB() {
        if (process.env.TEST_ENV)
            return Config.test.database.name;
        return Config.database.name;
    }

    private getMysqlPool() {
        return mysql.createPool({
            host: PrivateConfig.database.url,
            port: PrivateConfig.database.port,
            user: PrivateConfig.database.user,
            password: PrivateConfig.database.password
        });
    }

    async init() {
        await this.initDatabase(Config.database.name);
    }

    /**
     * Create DB and generate tables for the specified database
     * @param dbName
     */
    async initDatabase(dbName?: string) {
        if (!dbName) {
            dbName = this.dbName;
        }
        this.createMysqlPool();
        await this.createDatabaseIfNotExists(dbName);
        await this.upsertTables();
        await Counter.init();
    }

    createMysqlPool() {
        this.mysqlPool = this.getMysqlPool();
    }

    async getMysqlConn(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.mysqlPool.getConnection((err, conn) => {
                if (err) return reject(err);
                resolve(conn);
            });
        });
    }

    async createDatabaseIfNotExists(dbName: string) {
        console.log(`attempting to create database ${dbName} ${PrivateConfig.database.user == 'root'} ${PrivateConfig.database.password == 'adminadmin'}`);
        return new Promise(async (resolve, reject) => {
            const conn = await this.getMysqlConn();
            conn.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`, (err, result) => {
                if (err) return reject(err);
                if (result.warningCount !== 1) {
                    console.log(`Database ${dbName} has been created`);
                }
                conn.release();
                resolve();
            });
        });
    }

    async dropDatabase(dbName?: string) {
        if (process.env.NODE_ENV === 'production') {
            console.log('dropDatabase called in production. This should not happen.');
            return;
        }

        if (!dbName) {
            dbName = this.dbName;
        }

        console.log(`attempting to drop database ${dbName}`);
        return new Promise(async (resolve, reject) => {
            const conn = await this.getMysqlConn();
            conn.query('DROP DATABASE ' + dbName, (err, result) => {
                if (err && err.message.includes("database doesn't exist")) return resolve(false);
                if (err) return reject(err);
                conn.release();
                resolve(result.affectedRows > 0);
            });
        });
    }

    async databaseExists(dbName: string) {
        return new Promise(async (resolve, reject) => {
            const conn = await this.getMysqlConn();
            conn.query(`SHOW DATABASES LIKE '${dbName}'`, (err, result) => {
                if (err) return reject(err);
                conn.release();
                resolve(result.length > 0);
            });
        });
    }

    async getTables() {
        return await this.sequelize.getQueryInterface().showAllSchemas();
    }

    /**
     * Initialize the model objects
     * TODO: make more data-driven
     */
    initModels() {
        this.Tally = this.sequelize.import('../models/tally');
        this.Timer = this.sequelize.import('../models/timer');
        this.Announcement = this.sequelize.import('../models/announcement');
        this.Channel = this.sequelize.import('../models/channel');
        this.Server = this.sequelize.import('../models/server');
        this.Permission = this.sequelize.import('../models/permission');
    }

    async upsertTables() {
        console.log('creating and/or altering Tally table');
        await this.Tally.sync({
            alter: true
        });
        console.log('creating and/or altering Timer table');
        await this.Timer.sync({
            alter: true
        });
        console.log('creating and/or altering Announcement table');
        await this.Announcement.sync({
            alter: true
        });
        console.log('creating and/or altering Channel table');
        await this.Channel.sync({
            alter: true
        });
        console.log('creating and/or altering Server table');
        await this.Server.sync({
            alter: true
        });
        console.log('creating and/or altering Permission table');
        await this.Permission.sync({
            alter: true
        });
    }

    async truncateTables() {
        await this.Tally.truncate();
        await this.Timer.truncate();
        await this.Announcement.truncate();
        await this.Channel.truncate();
        await this.Server.truncate();
        await this.Permission.truncate();
    }

    async createTally(channelId: string, serverId: string, isGlobal: boolean, name: string, description: string, keyword?: string) {
        const maxDescriptionLen = this.TALLY_DESCRIPTION_MAXLEN;
        if (description.length > maxDescriptionLen) {
            throw new Error('description cannot be longer than ' + this.TALLY_DESCRIPTION_MAXLEN + ' characters, including emojis');
        }

        const Tally = await this.Tally.create({
            channelId,
            serverId,
            isGlobal,
            name,
            description: Buffer.from(description).toString('base64'),
            count: 0,
            keyword: keyword ? keyword : null,
            base64Encoded: true
        });

        console.log(`
            Tally Created
            -------------
            channelId: ${channelId}
            serverId: ${serverId}
            isGlobal: ${isGlobal}
            name: ${name}
            description: ${description}
            keyword: ${keyword || null}
            `);

        return Tally;
    }

    async getTally(channelId, serverId, isGlobal, name) {
        const where = {
            channelId,
            serverId,
            isGlobal,
            name
        };
        if (isGlobal === true) delete where.channelId;
        const tally = await this.Tally.findOne({
            where
        });
        if (!tally) return null;
        tally.description = Buffer.from(tally.description, 'base64').toString();
        return tally;
    }

    async getTallies(channelId, serverId, isGlobal) {
        const where = {
            channelId,
            serverId,
            isGlobal
        };
        if (isGlobal === true) delete where.channelId;
        const tallies = await this.Tally.findAll({
            where
        });
        for (const tally of tallies) {
            tally.description = Buffer.from(tally.description, 'base64').toString();
        }
        return tallies;
    }

    async initServers(servers: any) {
        servers.map(async server => {
            try {
                await this.Server.upsert({
                    id: server.id
                });
            } catch (e) {
                console.log(`Failed to upsert Server record on init. Reason: ${e}`);
            }
        });
    }

    async setTallyDescription(channelId, serverId, isGlobal, name, description) {
        if (description.length > this.TALLY_DESCRIPTION_MAXLEN) {
            throw new Error('description cannot be longer than ' + this.TALLY_DESCRIPTION_MAXLEN + ' characters.');
        }

        const tally = await this.getTally(channelId, serverId, isGlobal, name);

        if (!tally) throw new Error('could not find tally to set description');

        tally.description = Buffer.from(description).toString('base64');
        await tally.save();
    }

    async updateTally(channelId, serverId, isGlobal, name, updateObj) {
        const tally = await this.getTally(channelId, serverId, isGlobal, name);
        if (!tally) throw new Error(`could not find tally to update`);
        return await tally.update(updateObj);
    }

    async deleteTally(channelId, serverId, isGlobal, name) {
        const tally = await this.getTally(channelId, serverId, isGlobal, name);
        if (!tally) throw new Error(`could not find tally to delete`);
        return await tally.destroy();
    }

    async initServer(id: string) {
        try {
            await this.Server.upsert({ id });
        } catch (e) {
            console.log(`Failed to upsert Server record on init. Reason: ${e}`);
        }
    }

    async getTallyCount() {
        return this.Tally.findAll({
            where: {}
        }).then(tallies => tallies.length);
    }

    async getCount(name: string, channelId: string) {
        try {
            let tally = await this.Tally.findOne({
                where: {
                    name: name,
                    channelId: channelId
                }
            });
            return tally.count;
        } catch (e) {
            console.log(`Error while getting count for ${name}: ${e}`);
        }
    }

    async getKeywords(channelId: string) {
        const res = await this.Tally.findAll({
            where: {
                channelId: channelId
            }
        });
        return res
            .filter(tally => {
                return tally != null;
            })
            .map(tally => {
                return tally.keyword;
            });
    }

    async keywordExists(channelId: string, key: string) {
        const res = await this.Tally.findAll({
            where: {
                channelId: channelId,
                keyword: key
            }
        });
        return res.length != 0;
    }

    async bumpKeywordTally(channelId, keyword) {
        if (keyword === null || keyword === undefined) return;
        const tallies = await this.Tally.findAll({
            where: {
                channelId: channelId,
                keyword: keyword
            }
        });
        const promises = tallies.map(async tally => {
            tally.count = tally.count + 1;
            return tally.save();
        });
        await Promise.all(promises);
    }

    async getAnnouncement(channelId: string, name: string) {
        const announce = await this.Announcement.findOne({
            where: {
                channelId,
                name
            }
        });
        return announce;
    }

    async createAnnouncement(channelId, name, description) {
        const announce = await this.Announcement.create({
            channelId: channelId,
            name: name,
            description: description
        });
        console.log(`
            Created Announcement
            --------------------
            channelId: ${channelId}
            name: ${name}
            description: ${description}
        `);
        return announce;
    }

    async upsertAnnouncement(channelId, name, description) {
        const announce = await this.Announcement.upsert({
            channelId: channelId,
            name: name,
            description: description
        });
        console.log(`
            Upserted Announcement
            --------------------
            channelId: ${channelId}
            name: ${name}
            description: ${description}
        `);
        return announce;
    }

    async deleteAnnouncement(channelId, name) {
        return await this.Announcement.destroy({
            where: {
                channelId,
                name
            }
        });
    }

    async activateAnnouncement(channelId, name) {
        const announcement = await this.Announcement.findOne({
            where: {
                channelId: channelId,
                name: name
            }
        });
        if (!announcement) throw new Error('No announcement found to update.');
        announcement.active = true;
        await announcement.save();
    }

    async setAnnounceName(channelId, name, newName) {
        const announcement = await this.Announcement.findOne({
            where: {
                channelId: channelId,
                name: name
            }
        });
        if (!announcement) throw new Error('No announcement found to update.');
        announcement.name = newName;
        await announcement.save();
    }

    async setAnnounceDesc(channelId, name, description) {
        const announcement = await this.Announcement.findOne({
            where: {
                channelId: channelId,
                name: name
            }
        });
        if (!announcement) throw new Error('No announcement found to update.');
        announcement.description = description;
        await announcement.save();
    }

    async setAnnounceTallyGoal(channelId, name, tallyName, tallyGoal) {
        const announcement = await this.Announcement.findOne({
            where: {
                channelId: channelId,
                name: name
            }
        });
        if (!announcement) throw new Error('No announcement found to update.');
        announcement.announcementRan = null;
        announcement.dateQuery = null;
        announcement.date = null;
        announcement.tallyGoal = tallyGoal;
        announcement.tallyName = tallyName;
        await announcement.save();
    }

    async setAnnounceDate(channelId, name, dateStr) {
        const announcement = await this.Announcement.findOne({
            where: {
                channelId: channelId,
                name: name
            }
        });
        if (!announcement) throw new Error('No announcement found to update.');
        announcement.announcementRan = null;
        announcement.datePattern = dateStr;
        announcement.tallyGoal = null;
        announcement.tallyName = null;
        await announcement.save();
    }

    async deleteAnnounce(channelId, name) {
        return await this.Announcement.destroy({
            where: {
                channelId: channelId,
                name: name
            }
        });
    }

    /**
     * normalize tallies by adding their serverId to any tally that belonds to a channel
     * @param channels
     */
    async normalizeTallies(channels) {
        const tallies = await this.getUnnormalizedTallies();
        if (tallies.length > 0) console.log(`Normalizing tally schemas for ${tallies.length} tallies.`);
        for (let tally of tallies) {
            const channel = channels.get(tally.channelId);
            if (!channel) continue;
            const server = channel.guild;
            tally.serverId = server.id;
            tally.isGlobal = false;
            tally.save();
            console.log(`Assigned channel [${channel.id}] to server [${server.id}]`);
        }
        await this.encodeTallyDescriptions();
    }

    async getUnnormalizedTallies() {
        const Tally = this.Tally;
        const tallies = await Tally.findAll({
            where: {
                [Sequelize.Op.or]: [
                    {
                        serverId: null
                    },
                    {
                        isGlobal: null
                    }
                ],
                channelId: {
                    [Sequelize.Op.ne]: 'INTERNAL'
                }
            }
        });
        return tallies;
    }

    async encodeTallyDescriptions() {
        const Tally = this.Tally;
        const tallies = await Tally.findAll({
            where: {
                base64Encoded: false
            }
        });
        for (const tally of tallies) {
            const description = tally.description;
            tally.description = Buffer.from(description).toString('base64');
            tally.base64Encoded = true;
            await tally.save();
        }
    }
}
