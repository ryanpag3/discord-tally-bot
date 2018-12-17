import {
    Sequelize,
    DataTypes
} from 'sequelize';

export default (sequelize: Sequelize, DataTypes: DataTypes) => {
    return sequelize.define('announcement', {
        name: DataTypes.STRING,
        channelId: DataTypes.STRING,
        description: DataTypes.STRING,
        dateQuery: { type: DataTypes.STRING, defaultValue: null },
        tallyName: { type: DataTypes.STRING, defaultValue: null },
        tallyGoal: { type: DataTypes.INTEGER, defaultValue: null },
    }, {
        timestamps: false,
        indexes: [{
            fields: ['name', 'channelId'],
            unique: true
        }]
    });
}