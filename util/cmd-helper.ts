export default {
    removePrefixCommand: (messageContent: string, commandLength) => {
        let msgArr = messageContent.split(' ');
        for (let i = 0; i < commandLength; i++) {
            msgArr.shift();
        }
        return msgArr.join(' ');
    }
}