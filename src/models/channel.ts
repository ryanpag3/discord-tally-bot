import {
    Sequelize,
    DataTypes
} from 'sequelize';

export default (sequelize: Sequelize, DataTypes: DataTypes) => {
    return sequelize.define('channel', {
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        timezone: DataTypes.STRING,
        lastPatchAnnounced: { type: DataTypes.STRING, defaultValue: null },
        patchNotesEnabled: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, {
        timestamps: false
    });
}