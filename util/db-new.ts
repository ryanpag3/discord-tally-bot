import Sequelize from 'sequelize';
import mysql from 'mysql';
import Config from '../config.json';
import PrivateConfig from '../config-private.json';
import Counter from './counter';
import Sqlize from './sqlize';

export default class DB {
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
        if (dbName === undefined)
            dbName = Config.database.name;
        this.dbName = dbName;
        this.sequelize = new Sqlize(dbName);
        this.initModels();
    }

    private getMysqlPool() {
        return mysql.createPool({
            host: PrivateConfig.database.url,
            user: PrivateConfig.database.user,
            password: PrivateConfig.database.password
        });
    }

    /**
     * Open a connection and get sequelize object
     * @param dbName 
     */
    private getSequelize(dbName: string) {
        return new Sequelize({
            host: PrivateConfig.database.url,
            database: dbName,
            username: PrivateConfig.database.user,
            password: PrivateConfig.database.password,
            dialect: Config.database.dialect,
            operatorsAliases: false,
            logging: false
        });
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
        console.log(`attempting to create database ${dbName}`);
        return new Promise(async (resolve, reject) => {
            const conn = await this.getMysqlConn();
            conn.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`, (err, result) => {
                if (err) return reject(err);
                if (result.warningCount !== 1) {
                    console.log(`Database ${dbName} has been created`);
                }
                conn.release();
                resolve();
            })
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
                if (err && err.message.includes('database doesn\'t exist')) return resolve(false);
                if (err) return reject(err);
                conn.release();
                resolve(result.affectedRows > 0);
            });
        })

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

    async createTally(channelId: string, serverId: string, isGlobal: boolean, 
        name: string, description: string, keyword?: string) {
            const maxDescriptionLen = 255;
            if (description.length > maxDescriptionLen) {
                throw new Error('description cannot be longer than 255 characters, including emojis');
            }

            await this.Tally.create({
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
            `)
    }
}