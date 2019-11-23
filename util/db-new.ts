import Sequelize from 'sequelize';
import mysql from 'mysql';
import Config from '../config.json';
import PrivateConfig from '../config-private.json';

export default class DB {
    mysqlConn = this.getMysql();
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
        this.sequelize = this.getSequelize(dbName);
        this.initModels();
    }

    /**
     * Create a connection object to mysql
     * Note: this does not connect
     */
    private getMysql() {
        return mysql.createConnection({
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
        await this.connectMysqlClient();
        await this.createDatabaseIfNotExists(dbName);
        await this.upsertTables();
    }

    async connectMysqlClient() {
        return new Promise((resolve, reject) => {
            this.mysqlConn.connect(err => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    async createDatabaseIfNotExists(dbName: string) {
        return new Promise((resolve, reject) => {
            this.mysqlConn.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`, (err, result) => {
                if (err) return reject(err);
                if (result.warningCount !== 1) {
                    console.log(`Database ${dbName} has been created`);
                }
                resolve();
            })
        });
    }

    async dropDatabase(dbName: string) {
        if (process.env.NODE_ENV === 'production') {
            console.log('dropDatabase called in production. This should not happen.');
            return;
        }

        return new Promise((resolve, reject) => {
            this.mysqlConn.query('DROP DATABASE ' + dbName, (err, result) => {
                if (err && err.message.includes('database doesn\'t exist')) return resolve(false);
                if (err) return reject(err);
                resolve(result.affectedRows > 0);
            });
        })

    }

    async databaseExists(dbName: string) {
        return new Promise((resolve, reject) => {
            this.mysqlConn.query(`SHOW DATABASES LIKE '${dbName}'`, (err, result) => {
                if (err) return reject(err);
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
}