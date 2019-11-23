import Sequelize from 'sequelize';
import PrivateConfig from '../config-private.json';
import Config from '../config.json';

/**
 * This maintains the singleton sequelize client
 */
export default class Sqlize {
    static dbName;
    static instance;

    constructor(dbName: string) {
        if (!Sqlize.instance || Sqlize.dbName !== dbName) {
            Sqlize.instance = this.getSequelize(dbName);
        }
        return Sqlize.instance; 
    }

    getSequelize(dbName: string) {
        console.log('getting new sequelize instance for db ' + dbName);
        return new Sequelize({
            host: PrivateConfig.database.url,
            database: dbName,
            username: PrivateConfig.database.user,
            password: PrivateConfig.database.password,
            dialect: Config.database.dialect,
            operatorsAliases: false,
            logging: false,
            pool: {
                max: 25,
                min: 0,
                acquire: 30000,
                idle: 10000
            }
        });
    }
}