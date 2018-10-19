import {
    Sequelize,
    DataTypes
} from 'sequelize';

export default (sequelize: Sequelize, DataTypes: DataTypes) => {
    return sequelize.define('timer', {
        name: DataTypes.STRING,
        channelId: DataTypes.STRING,
        description: DataTypes.STRING,
        startTime: DataTypes.DATE,
        endTime: DataTypes.DATE
    }, {
        timestamps: false,
        indexes: [{
            fields: ['name', 'channelId'],
            unique: true
        }]
    });
}