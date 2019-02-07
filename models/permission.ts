import {
    Sequelize,
    DataTypes
} from 'sequelize';

export default (sequelize: Sequelize, DataTypes: DataTypes) => {
    return sequelize.define('permission', {
        id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        serverId: DataTypes.STRING,
        command: DataTypes.STRING,
        roleId: DataTypes.STRING,
    }, {
        timestamps: false,
        indexes: [{
            fields: ['serverId', 'command'],
            unique: true
        }]
    });
}