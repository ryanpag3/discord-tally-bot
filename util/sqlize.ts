import Sequelize from 'sequelize';
import PrivateConfig from '../config-private';
import Config from '../config';
import logger from './logger';

/**
 * This maintains the singleton sequelize client
 */
export default class Sqlize {
    static dbName;
    static instance;

    constructor(dbName: string) {
        if (!Sqlize.instance || Sqlize.dbName !== dbName) {
            Sqlize.instance = this.getSequelize(dbName);
            Sqlize.dbName = dbName;
        }
        return Sqlize.instance; 
    }

    getSequelize(dbName: string) {
        logger.info('getting new sequelize instance for db ' + dbName);
        return new Sequelize({
            host: PrivateConfig.database.url,
            database: dbName,
            username: PrivateConfig.database.user,
            password: PrivateConfig.database.password,
            port: PrivateConfig.database.port,
            dialect: Config.database.dialect,
            operatorsAliases: false,
            logging: false,
            pool: {
                max: 25,
                min: 0,
                acquire: 100000,
                idle: 10000
            }
        });
    }
}