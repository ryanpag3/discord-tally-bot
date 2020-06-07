import { Sequelize, DataTypes } from 'sequelize';

export default (sequelize: Sequelize, DataTypes: DataTypes) => {
    return sequelize.define(
        'tally_group',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            serverId: DataTypes.STRING,
            channelId: DataTypes.STRING,
            name: {
                type: DataTypes.STRING,
            },
            tallyNames: DataTypes.STRING(2500),
            description: DataTypes.STRING(500)
        },
        {
            timestamps: false,
            indexes: [
                {
                    fields: ['serverId', 'channelId', 'name'],
                    unique: true,
                },
            ],
        }
    );
};
