const Config: any = {
    prefix: process.env.COMMAND_PREFIX || "!tb ",
    database: {
        name: process.env.DB_NAME || "tally_bot_db",
        dialect: process.env.DB_DIALECT || "mysql"
    },
    status: {
        interval: 10000,
        interval_dev: 5000
    },
    delete_timeout: 1250,
    announce_check_interval: 60000,
    announce_check_internal_dev: 10000,
    test: {
        database: {
            name: process.env.TEST_DB_NAME || "tallybot_test_db"
        }
    }
}

export default Config;