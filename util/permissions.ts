import cmdHelper from "./cmd-helper";

export default class Permissions {

    static isPermissionCommand(commandArr): boolean {
        return (commandArr[2] && commandArr[2] == '-role');
    }

    static isGlobalPermissionCommand(commandArr): boolean {
        return commandArr[1] == '-role';
    }

    static checkIfValid(user) {

    }

    static setAllPermissions(message) {
        console.log('global');
        const mArr = message.content.split(' ');
        try {
            const roles = message.guild.roles.map(role => role.name);
            const isValid = Permissions.isValidServerRole(message.guild, mArr[2]);
            if (!isValid) throw `${mArr[2]} is not a valid role for this server. Valid roles are the following: \n[${roles.toString()}]`;
            
        } catch (e) {
            const richEmbed = {
                description: `Could not set all permissions. Reason ${e}`
            }
            message.channel.send(cmdHelper.buildRichMsg(richEmbed));
        }
    }

    static setPermissionRole(message) {
        console.log('hi mama');
    }

    static getPermissionRole(channelId, permissionId) {

    }

    static isValidServerRole(server, roleName) {
        return server.roles.find(role => role.name === roleName) != null;
    }
}