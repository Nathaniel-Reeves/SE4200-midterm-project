const WebSocket = require('ws');
const express = require('express');
const cookieParser = require("cookie-parser");
const session = require('express-session');
const cors = require('cors');

const User = require('./models/user');

app = express();

const { ConnectionClosedEvent } = require('mongodb');

const port = process.env.PORT || 8080;
app.use(express.static(__dirname+'/views'));

// Setup sessions
const oneDay = 1000 * 60 * 60 * 24;
app.use(session({
    secret: "akS:LGjja;g:LSg*098a09sDSG)(DfSDG)*(dfASGaspdofSD)G98DF*GSD^G&^$%SdgSD#g$%^DS47g56SDgasd",
    saveUninitialized: true,
    resave: false
}));
app.use(cookieParser());

// tack on middleware
app.use(express.json());
app.use(cors({
    credentials: true,
    origin: function (origin, callback) {
        // Dynamic Cors Origin Setter
        callback(null, origin);  
    }
}));

app.get('/', (req, res) => {
    console.log(session);
    session=req.session;
    console.log("GET /")
    res.render('index.html');
});

require('./handlers/user').user_handlers(app);
require('./handlers/judge_score').judge_score_handlers(app);
require('./handlers/team').team_handlers(app);

app.listen(port, function () {
    console.log(`Codecamp app listening on port ${port}!`);
});

const wss = new WebSocket.Server({ server:app });

// Handle WebSocket connection
wss.on('connection', function connection(wsclient) {

    console.log("Socket Client Connected")
    console.log(wsclient);

    // Handle WebSocket messages
    wsclient.on('message', function (data) {

        // Send a response back to all clients
        wss.clients.forEach(function (client) {
            if (client.readyState == WebSocket.OPEN) {
                client.send(data, {binary: false });
            }
        });
    });

    // Handle WebSocket disconnections
    wsclient.on('disconnect', () => {
        console.log('WebSocket client disconnected');
    });
});