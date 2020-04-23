export default class StringUtil {
    static base64Encode(str: string) {
        return Buffer.from(str).toString('base64');
    }

    static base64Decode(encodedStr: string) {
        return Buffer.from(encodedStr, 'base64').toString('utf8');
    }
}