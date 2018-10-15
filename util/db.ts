import Sequelize from 'sequelize';
import mysql from 'mysql';
import pConfig from '../config-private.json';
import config from '../config.json';

// models
import Tally from '../models/tally';

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

export default {
    tally: sequelize.import('tally', Tally),
    init() {
        conn.connect((err) => {
            if (err) throw err;
            conn.query('CREATE DATABASE IF NOT EXISTS ' + config.database.name, (err, result) => {
                if (err) throw err;
                if (result.warningCount != 1)
                    console.log('Databse ' + config.database.name + ' has been created.');
                this.tally.sync();
            });
        });
    },

    async getTallyCount() {
        return this.tally.findAll({ where: {}})
            .then((tallies) => tallies.length);
    }
}