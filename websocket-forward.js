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
    console.log('new connection');

    const server = net.createServer();
    server.maxConnections = 1;
    server.listen(adbPort, function () {
        console.log('server listening to %j', server.address());
    });

    server.on('connection', function (tcps) {
        var remoteAddress = tcps.remoteAddress + ':' + tcps.remotePort;
        console.log('new client connection from %s', remoteAddress);
        websocket.pipe(tcps).pipe(websocket);
    });
}
