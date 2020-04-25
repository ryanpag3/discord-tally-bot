import {
    Sequelize,
    DataTypes
} from 'sequelize';

export default (sequelize: Sequelize, DataTypes: DataTypes) => {
    return sequelize.define('server', {
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        lastPatchAnnounced: { type: DataTypes.STRING, defaultValue: null },
        patchNotesEnabled: { type: DataTypes.BOOLEAN, defaultValue: true },
        tallyReactionsEnabled: { type: DataTypes.BOOLEAN, defaultValue: false }
    }, {
        timestamps: false
    });
}