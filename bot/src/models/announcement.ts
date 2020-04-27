import {
    Sequelize,
    DataTypes
} from 'sequelize';

export default (sequelize: Sequelize, DataTypes: DataTypes) => {
    return sequelize.define('announcement', {
        id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        name: DataTypes.STRING,
        channelId: DataTypes.STRING,
        description: DataTypes.STRING,
        datePattern: { type: DataTypes.STRING, defaultValue: null },
        tallyName: { type: DataTypes.STRING, defaultValue: null },
        tallyGoal: { type: DataTypes.INTEGER, defaultValue: null },
        tallyGoalReached: { type: DataTypes.BOOLEAN, defaultValue: false },
        active: {type: DataTypes.BOOLEAN, defaultValue: true }
    }, {
        timestamps: false,
        indexes: [{
            fields: ['name', 'channelId'],
            unique: true
        }]
    });
}