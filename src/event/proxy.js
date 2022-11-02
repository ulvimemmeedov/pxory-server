const { logger, catchEvent } = require("../utils/helper");
const net = require("net");

const proxy = (clientToProxySocket) => {
    logger('someone connected!', "green");
    clientToProxySocket.once("data", (data) => {
        logger(data, "yellow")
        let isTLSConnection = data.toString().indexOf("CONNECT") !== -1;

        let serverPort = 80;
        let serverAddress;

        if (isTLSConnection) {
            serverPort = 443;

            serverAddress = data
                .toString()
                .split("CONNECT")[1]
                .split(" ")[1]
                .split(":")[0];
        } else {
            serverAddress = data.toString().split("Host: ")[1].split("\n")[0];
        }

        let proxyToServerSocket = net.createConnection({
            host: serverAddress,
            port: serverPort
        }, () => {
            logger("Proxy server connected", "green");
        });

        if (isTLSConnection) {
            clientToProxySocket.write("HTTP/1.1 200 OK\r\n\n");
        } else {
            proxyToServerSocket.write(data);
        }

        clientToProxySocket.pipe(proxyToServerSocket);
        proxyToServerSocket.pipe(clientToProxySocket);

        catchEvent(proxyToServerSocket);
        catchEvent(clientToProxySocket);
    })
}

module.exports = proxy;