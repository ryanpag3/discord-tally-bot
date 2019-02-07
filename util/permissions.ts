import cmdHelper from "./cmd-helper";
import DB from './db';
import Commands from '../static/Commands';

export default class Permissions {

    static isPermissionCommand(commandArr): boolean {
        return (commandArr[2] && commandArr[2] == '-role');
    }

    static isGlobalPermissionCommand(commandArr): boolean {
        return commandArr[1] == '-role';
    }

    static async hasPermission(message) {
        try {
            const mArr = message.content.split(' ');
            const isValid = Permissions.isValidCommand(mArr[1]);
            if (!isValid) throw new Error('invalid command');
            const permission: any = await DB.Permission.findOne({
                where: {
                    serverId: message.guild.id,
                    command: mArr[1]
                }
            });
            if ((Permissions.isGlobalPermissionCommand(mArr) ||
                Permissions.isPermissionCommand(mArr)) && Permissions.isAdminUser(message.member)) return true;
            return permission == null || message.member.roles.has(permission.roleId);
        } catch (e) {
        }
        return false;
    }

    static async setAllPermissions(message) {
        const Permission = DB.Permission;
        const mArr = message.content.split(' ');
        try {
            const roles = message.guild.roles.map(role => role.name);
            mArr.splice(0, 2);
            let roleStr = mArr.join(' ');
            const isValid = Permissions.isValidServerRole(message.guild, roleStr);
            if (!isValid) throw `${mArr[2]} is not a valid role for this server. Valid roles are the following: \n[${roles.toString()}]`;
            const roleId = Permissions.getRoleId(message.guild.roles, roleStr);
            const keys = Object.keys(Commands);
            for (let key of keys) {
                await Permission.upsert({
                    serverId: message.guild.id,
                    roleId: roleId,
                    command: Commands[key]
                });
            }

            const richEmbed = {
                description: `All commands now require role: **${roleStr}**`
            };
            cmdHelper.finalize(message);
            message.channel.send(cmdHelper.buildRichMsg(richEmbed));
        } catch (e) {
            const richEmbed = {
                description: `Could not set all permissions. Reason: ${e}`
            }
            message.channel.send(cmdHelper.buildRichMsg(richEmbed));
        }
    }

    static async setPermissionRole(message) {
        try {
            const Permission = DB.Permission;
            const roles = message.guild.roles.map(role => role.name);
            const mArr = message.content.split(' ');
            const rawCommand = mArr[1];
            if (!mArr[3]) throw `Role definition missing for role command. Please provide one.`

            mArr.splice(0, 3);
            let roleStr = mArr.join(' ');

            const command = Commands[rawCommand.toUpperCase()];
            if (!command) throw `Invalid command listed for permission definition.`;

            const isValid = Permissions.isValidServerRole(message.guild, roleStr);
            if (!isValid) throw `${roleStr} is not a valid role for this server. Valid Roles are the following: \n[${roles.toString()}]`

            const roleId = Permissions.getRoleId(message.guild.roles, roleStr);

            await Permission.upsert({
                serverId: message.guild.id,
                roleId: roleId,
                command: command
            });

            const richEmbed = {
                description: `!tb ${command} now require role: **${roleStr}**`
            };
            cmdHelper.finalize(message);
            message.channel.send(cmdHelper.buildRichMsg(richEmbed));
        } catch (e) {
            const richEmbed = {
                description: `Could not set permission. Reason: ${e}`
            }
            message.channel.send(cmdHelper.buildRichMsg(richEmbed));
        }
    }

    static getPermissionRole(channelId, permissionId) {

    }

    static isValidServerRole(server, roleName) {
        return server.roles.find(role => role.name === roleName) != null;
    }

    static isValidCommand(command) {
        return Commands[command.toUpperCase()] != undefined || command == '-role';
    }

    static getRoleId(roles, targetRoleName) {
        const role = roles.find(role => role.name == targetRoleName);
        return role.id;
    }

    static isAdminUser(user) {
        return user.hasPermission('ADMINISTRATOR');
    }
}