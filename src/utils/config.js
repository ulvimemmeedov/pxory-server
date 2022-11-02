const { getEnv } = require("./helper");

const { PORT, HOST } = getEnv();

const config = {
    server: {
        host: HOST,
        port: PORT
    }
}


module.exports = config;