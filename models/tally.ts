import {
    Sequelize,
    DataTypes
} from 'sequelize';

export default (sequelize: Sequelize, DataTypes: DataTypes) => {
    return sequelize.define('tally', {
        name: {
            type: DataTypes.STRING
        },
        channelId: DataTypes.STRING,
        serverId: DataTypes.STRING,
        description: DataTypes.STRING,
        count: DataTypes.BIGINT,
        keyword: DataTypes.STRING
    }, {
        timestamps: false,
        indexes: [{
            fields: ['name', 'channelId', 'serverId'],
            unique: true
        }]
    });
}