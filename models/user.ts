import { Sequelize, DataTypes } from 'sequelize';

export default (sequelize: Sequelize, DataTypes: DataTypes) => {
    return sequelize.define('user', {
        id: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        tutorialEnabled: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        currentDialog: {
            type: DataTypes.STRING
        },
        currentDialogStage: {
            type: DataTypes.TINYINT
        }
    });
}