const PrivateConfig: any = {
    token: process.env.DISCORD_TOKEN,
    dbots_token: process.env.DBOTS_TOKEN,
    database: {
        url: process.env.DATABASE_URL,
        port: process.env.DATABASE_PORT,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD
    },
    channels: {
        suggestions: process.env.SUGGEST_CHANNEL,
        bugs: process.env.BUGS_CHANNEL
    },
    test: {
        channels: {
            suggestions: process.env.TEST_SUGGEST_CHANNEL,
            bugs: process.env.TEST_BUGS_CHANNEL
        }
    }
}

export default PrivateConfig;