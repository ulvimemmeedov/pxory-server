const net = require("net");
const proxy = require("./event/proxy");
const config = require("./utils/config");
const { catchEvent, logger } = require("./utils/helper");


const server = net.createServer();

server.on('connection', proxy);

catchEvent(server);

server.listen(config.server, () => {
    logger(`Server running ${config.server.host}:${config.server.port}`, "green");
})
