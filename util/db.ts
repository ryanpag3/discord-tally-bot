import Sequelize from 'sequelize';
import mysql from 'mysql';
import dedent from 'dedent-js';
import Config from '../config';
import PrivateConfig from '../config-private';
import Counter from './counter';
import Sqlize from './sqlize';
import logger from './logger';
import Default from '../static/Default';
import tally from '../models/tally';

export default class DB {
    private TALLY_NAME_MAXLEN = 16;
    private TALLY_DESCRIPTION_MAXLEN = 255;
    mysqlPool;
    sequelize;
    dbName;

    // tables
    Tally;
    Timer;
    Announcement;
    Channel;
    User;
    Server;
    Permission;

    constructor(dbName?: string) {
        if (dbName === undefined) dbName = this.getConfiguredDB();
        this.dbName = dbName;
        this.sequelize = new Sqlize(dbName);
        this.initModels();
    }

    private getConfiguredDB() {
        if (process.env.TEST_ENV) return Config.test.database.name;
        return Config.database.name;
    }

    private getMysqlPool() {
        return mysql.createPool({
            host: PrivateConfig.database.url,
            port: PrivateConfig.database.port,
            user: PrivateConfig.database.user,
            password: PrivateConfig.database.password,
            acquireTimeout: 1000000
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
        logger.info(`attempting to create database ${dbName}`);
        return new Promise(async (resolve, reject) => {
            const conn = await this.getMysqlConn();
            conn.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`, (err, result) => {
                if (err) return reject(err);
                if (result.warningCount !== 1) {
                    logger.info(`Database ${dbName} has been created`);
                }
                conn.release();
                resolve();
            });
        });
    }

    async dropDatabase(dbName?: string) {
        if (process.env.NODE_ENV === 'production') {
            logger.info('dropDatabase called in production. This should not happen.');
            return;
        }

        if (!dbName) {
            dbName = this.dbName;
        }

        logger.info(`attempting to drop database ${dbName}`);
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
        this.User = this.sequelize.import('../models/user');
        this.Permission = this.sequelize.import('../models/permission');
    }

    async upsertTables() {
        logger.info('creating and/or altering Tally table');
        await this.Tally.sync({
            alter: true
        });
        logger.info('creating and/or altering Timer table');
        await this.Timer.sync({
            alter: true
        });
        logger.info('creating and/or altering Announcement table');
        await this.Announcement.sync({
            alter: true
        });
        logger.info('creating and/or altering Channel table');
        await this.Channel.sync({
            alter: true
        });
        logger.info('creating and/or altering User table');
        await this.User.sync({
            alter: true
        });
        logger.info('creating and/or altering Server table');
        await this.Server.sync({
            alter: true
        });
        logger.info('creating and/or altering Permission table');
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

    async createTally(tally: any) {
        if (!tally.name) throw new Error(`Name is required to create a tally.`);
        if (tally.name.length > this.TALLY_NAME_MAXLEN) throw new Error(`Tally name cannot be longer than ${this.TALLY_NAME_MAXLEN} characters.`);
        if (!tally.description) tally.description = `no description.`;
        if (tally.description.length > this.TALLY_DESCRIPTION_MAXLEN)
            throw new Error('description cannot be longer than ' + this.TALLY_DESCRIPTION_MAXLEN + ' characters, including emojis');
        tally.description = Buffer.from(tally.description).toString('base64');
        tally.base64Encoded = true;
        tally.count = 0;
        tally.createdOn = new Date();
        tally = await this.Tally.create(tally);
        tally.description = Buffer.from(tally.description, 'base64'); // no need to keep it encoded in memory
        return tally;
    }

    async createDmTally(userId: string, name: string, description: string) {
        const tally = await this.createTally({
            userId,
            name,
            description,
            isDm: true,
            isGlobal: false, // manually assign this instead of using default model value due to legacy support
            serverId: Default.USER_TALLY_SERVERID,
            channelId: Default.USER_TALLY_CHANNELID
        });
        logger.info(
            dedent(`\n
            DM Tally Created
            ----------------
            userId: ${userId}
            name: ${name}
            description: ${tally.description}
        `)
        );
        return tally;
    }

    async createCmdTally(channelId: string, serverId: string, isGlobal: boolean, name: string, description: string, keyword?: string, bumpOnKeyword?: boolean) {
        const tally = await this.createTally({
            channelId,
            serverId,
            userId: Default.CMD_TALLY_USERID,
            isGlobal,
            name,
            description,
            keyword,
            bumpOnKeyword
        });

        logger.info(
            dedent(`\n
            Tally Created
            -------------
            channelId: ${channelId}
            serverId: ${serverId}
            isGlobal: ${isGlobal}
            name: ${name}
            description: ${description}
            keyword: ${keyword || null}
            created on: ${new Date().toLocaleTimeString()}
            `)
        );

        return tally;
    }

    async getCmdTally(channelId, serverId, isGlobal, name) {
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

    async getDmTally(userId, name) {
        const t = await this.Tally.findOne({
            where: {
                userId,
                name
            }
        });
        if (!t) return null;
        t.description = Buffer.from(t.description, 'base64');
        return t;
    }

    async getCmdTallies(channelId, serverId, isGlobal, limit?: number, offset?: number) {
        const where = {
            channelId,
            serverId,
            isGlobal
        };
        if (isGlobal === true) delete where.channelId;
        const tallies = await this.Tally.findAll({
            where,
            order: [['count', 'DESC']],
            limit,
            offset
        });
        for (const tally of tallies) {
            tally.description = Buffer.from(tally.description, 'base64').toString();
        }
        return tallies;
    }

    async getDmTallies(userId: string, limit?: number, offset?: number) {
        const tallies = await this.Tally.findAll({
            where: {
                userId
            },
            order: [['count', 'DESC']],
            limit,
            offset
        });
        for (const tally of tallies) {
            tally.description = Buffer.from(tally.description, 'base64').toString();
        }
        return tallies;
    }

    async getCmdTalliesCount(channelId: string, serverId: string, isGlobal: boolean) {
        const where = {
            channelId,
            serverId,
            isGlobal
        };
        if (isGlobal === true) delete where.channelId;
        const count = await this.Tally.count({
            where
        });
        return count;
    }

    async getDmTalliesCount(userId: string) {
        const count = await this.Tally.count({
            where: {
                userId
            }
        });
        return count;
    }

    async initServers(servers: any) {
        servers.map(async server => {
            try {
                await this.Server.upsert({
                    id: server.id
                });
            } catch (e) {
                logger.info(`Failed to upsert Server record on init. Reason: ${e}`);
            }
        });
    }

    async setDmTallyDescription(userId: string, name: string, newDescription: string) {
        this.checkValidTallyDescription(newDescription);
        const t = await this.getDmTally(userId, name);
        await this.setTallyDescription(t, newDescription);
    }

    async setCmdTallyDescription(channelId, serverId, isGlobal, name, newDescription) {
        this.checkValidTallyDescription(newDescription);
        const tally = await this.getCmdTally(channelId, serverId, isGlobal, name);
        await this.setTallyDescription(tally, newDescription);
    }

    async setTallyDescription(tally: any, newDescription: string) {
        if (!tally) throw new Error('Could not find tally to set description');
        tally.description = Buffer.from(newDescription).toString('base64');
        await tally.save();
    }

    async checkValidTallyDescription(description: string) {
        if (description.length > this.TALLY_DESCRIPTION_MAXLEN) {
            throw new Error('description cannot be longer than ' + this.TALLY_DESCRIPTION_MAXLEN + ' characters.');
        }
    }

    async updateCmdTally(channelId, serverId, isGlobal, name, updateObj) {
        const tally = await this.getCmdTally(channelId, serverId, isGlobal, name);
        if (!tally) throw new Error(`could not find cmd tally to update`);
        return await tally.update(updateObj);
    }

    async updateDmTally(userId: string, name: string, update: any) {
        const tally = await this.getDmTally(userId, name);
        if (!tally) throw new Error(`could not find dm tally to update`);
        return await tally.update(update);
    }

    async updateCmdTallies(serverId: string, channelId: string, isGlobal: boolean, update: any) {
        const where: any = {
            serverId,
            channelId,
            isGlobal,
            userId: Default.CMD_TALLY_USERID
        };
        if (isGlobal) delete where.channelId;
        await this.Tally.update(update, {
            where
        });

        const tallies = await this.Tally.findAll({
            where
        });
        logger.info(`${tallies.length} tallies have been updated with ${JSON.stringify(update)}`);
        return tallies;
    }

    async updateDmTallies(userId: string, update: any) {
        await this.Tally.update(update, {
            where: {
                userId,
                serverId: Default.USER_TALLY_SERVERID,
                channelId: Default.USER_TALLY_CHANNELID
            }
        });
        const tallies = await this.Tally.findAll({
            where: {
                userId
            }
        });
        logger.info(`${tallies.length} tallies have been updated with ${JSON.stringify(update)}`);
        return tallies;
    }

    async deleteCmdTally(channelId, serverId, isGlobal, name) {
        const tally = await this.getCmdTally(channelId, serverId, isGlobal, name);
        if (!tally) throw new Error(`could not find tally to delete`);
        return await tally.destroy();
    }

    async deleteDmTally(userId: string, name: string) {
        const t = await this.getDmTally(userId, name);
        if (!t) throw new Error(`could not find tally to delete`);
        return await t.destroy();
    }

    async deleteTallies(where: any) {
        const tallies = await this.Tally.findAll({ where });
        await this.Tally.destroy({
            where
        });
        return tallies.length;
    }

    async initServer(id: string) {
        try {
            await this.Server.upsert({ id });
        } catch (e) {
            logger.info(`Failed to upsert Server record on init. Reason: ${e}`);
        }
    }

    async getTallyCount() {
        return await this.Tally.count({
            where: {}
        });
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
            logger.info(`Error while getting count for ${name}: ${e}`);
        }
    }

    async getKeywords(channelId: string, serverId: string) {
        const res = await this.Tally.findAll({
            where: {
                channelId: channelId,
                serverId
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

    async getGlobalKeywords(serverId: string) {
        const tallies = await this.Tally.findAll({
            where: {
                serverId,
                isGlobal: true
            }
        });
        return tallies.filter(t => t.keyword !== null).map(t => t.keyword);
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

    async handleKeywordTally(serverId, keyword, channelId?) {
        if (keyword === null || keyword === undefined) return;

        const where = {
            serverId,
            keyword
        };
        if (channelId) where['channelId'] = channelId;

        const tallies = await this.Tally.findAll({
            where
        });

        const promises = tallies.map(async tally => {
            if (tally.bumpOnKeyword === false) {
                logger.info(`keyword dump for tally ${tally.name}`);
                tally.count = tally.count - 1;
            } else {
                logger.info(`keyword bump for tally ${tally.name}`);
                tally.count = tally.count + 1;
            }
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
        logger.info(`
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
        logger.info(`
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
        if (tallies.length > 0) logger.info(`Normalizing tally schemas for ${tallies.length} tallies.`);
        for (let tally of tallies) {
            const channel = channels.get(tally.channelId);
            if (!channel) continue;
            const server = channel.guild;
            tally.serverId = server.id;
            tally.isGlobal = false;
            tally.save();
            logger.info(`Assigned channel [${channel.id}] to server [${server.id}]`);
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

    async getTimer(channelId: string, name: string) {
        return await this.Timer.findOne({
            where: {
                channelId,
                name
            }
        });
    }

    async createTimer(channelId: string, name: string, description?: string) {
        return await this.Timer.create({
            channelId,
            name,
            description,
            startDate: null,
            endDate: null,
            totTime: null
        });
    }

    /**
     * Base 64 a tally description and save it
     */
    async saveTally(tally: any) {
        tally.description = Buffer.from(tally.description).toString('base64');
        await tally.save();
    }

    async createUser(id: string) {
        return null;
    }

    async getUser(id: string) {
        return null;
    }
    
    async updateUser(id: string, update: any) {
        return null;
    }
}
