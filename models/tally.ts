import { Sequelize, DataTypes } from 'sequelize';

export default (sequelize: Sequelize, DataTypes: DataTypes) => {
    return sequelize.define('tally', {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            unique: true
        },
        channelId: DataTypes.STRING,
        description: DataTypes.STRING,
        count: DataTypes.BIGINT
    });
}
