const WebSocket = require('ws');
const express = require('express');

const app = express();
const port = process.env.PORT || 8080;

app.use(express.static("public"));

app.get("/widgets", function (req, res) {
    res.status(200).send("testing");
});

const server = app.listen(port, function() {
    console.log(`Server is listening on port ${port}`);
});

const wss = new WebSocket.Server({server: app});

wss.on('connection', function connection(wsclient) {
    wsclient.on('message', function (data) {
        wss.clients.forEach(function (client) {
            if (client.readyState == WebSocket.OPEN && client != wsclient) {
                client.send(data, {binary: false });
            }
        });
    });
});

// VUE CODE

var client = Vue.createApp({ // var app = Vue...
    data: function () {
        return {
        name: "DJ",
        messageToSend: "",
        socket: null
        };
    },
    methods: {
        connectSocket: function () {
            this.socket = new WebSocket("ws://localhost:8080");
            this.socket.onmessage = (event) => {
                this.handleMessageFromSocket(JSON.parse(event.data));
            };
        },
        handleMessageFromSocket: function (data) {
            console.log("Message recived from socket:", data);
        },
        sendMessageToSocket: function () {
            var message = {
                name: this.name,
                message: this.messageToSend
            };
            this.socket.send(JSON.stringify(message));
        }
    },
    created: function () {
        this.connectSocket();
    }
}).mount("#app");


// Send images by converting the binary to base 64 and sending them through json.
// get binary encodeing of an image, then use btoa libary to encode the binary back and forth from 64 to binary
// img src="data:image/png;base64, <image string in base 64>"