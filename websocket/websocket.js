const WebSocket = require('ws');

const wss = new WebSocket.Server({port: 8080});

wss.on('connection', function connection(wsclient) {
    wsclient.on('message', function (data) {
        wss.clients.forEach(function (client) {
            if (client.readyState == WebSocket.OPEN && client != wsclient) {
                client.send(data, {binary: false });
            }
        });
    });
});