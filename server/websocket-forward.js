'use strict';

const ws = require('websocket-stream');
const net = require('net');

let wsPort = 8080;
if (process.argv.length > 2) {
    wsPort = process.argv[2];
}
console.log(`using port ${wsPort} for websocket`);

let adbPort = 5555;
if (process.argv.length > 3) {
    adbPort = process.argv[3];
}
console.log(`using port ${adbPort} for ADB`);

const wss = new ws.Server({ port: wsPort }, onSocketConnect);
console.log('websocket server started');

function onSocketConnect(websocket) {
    console.log('new connection to websocket');

    const tcpServer = net.createServer();
    tcpServer.maxConnections = 1;
    tcpServer.listen(adbPort, function () {
        console.log('tcpServer listening to %j', tcpServer.address());
    });

    tcpServer.on('connection', function (tcpSocket) {
        const remoteAddress = tcpSocket.remoteAddress + ':' + tcpSocket.remotePort;
        console.log(`new client connection from ${remoteAddress}`);

        websocket.pipe(tcpSocket);
        tcpSocket.on('close', () => {
            console.log(`connect closed from ${remoteAddress}`);
            websocket.unpipe(tcpSocket);
            tcpSocket.unpipe(websocket); // is this needed or is it automatic?
        });

        tcpSocket.pipe(websocket, { end: false });
    });

    websocket.on('close', () => {
        console.log(`connection to websocket closed (${websocket.socket.closeReasonCode}): ${websocket.socket.closeDescription}`);
        tcpServer.close();
    });
}
