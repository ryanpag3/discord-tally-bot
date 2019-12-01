export default class Env {
    static isProduction() {
        return process.env.NODE_ENV !== undefined && process.env.NODE_ENV === 'production';
    }
}