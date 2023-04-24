const WebSocket = require('ws');
const express = require('express');
const cookieParser = require("cookie-parser");
const session = require('express-session');
const cors = require('cors');
const fs = require('fs');

const model = require('./models/user');

app = express();

const { ConnectionClosedEvent } = require('mongodb');

const port = process.env.PORT || 8080;
app.use(express.static(__dirname+'/public'));

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

var server = app.listen(port, '0.0.0.0', function () {
    console.log(`Codecamp app listening on port ${port}!`);
});

const wss = new WebSocket.Server({ server:server });

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function increment_active_slide(slideshow) {
    // Find the index of the current active slide
    const currentIndex = slideshow.findIndex(slide => slide.active === true);

    // Find the index of the next slide with list=1
    var nextIndex = slideshow.findIndex(slide => slide.id > currentIndex && slide.list === 1);

    // If no slide with list=1 was found after the current active slide, wrap around to the first slide with list=1
    if (nextIndex === -1) {
        nextIndex = slideshow.findIndex(slide => slide.list === 1);
    }

    // Update the array with the new active slide
    slideshow[currentIndex].active = false;
    slideshow[nextIndex].active = true;

    return slideshow;
}

function slide_clock(slide_interval) {
    console.log("Clock Started at interval: " + slide_interval);
    var clock = setInterval(function () {
        var codecamp_file = fs.readFileSync('./codecamp.json');
        var codecamp_data = JSON.parse(codecamp_file);
        codecamp_data.slide_show = increment_active_slide(codecamp_data.slide_show);
        wss.clients.forEach(function (client) {
            client.send(JSON.stringify(codecamp_data), {binary: false });
        });
        fs.writeFile(
            './codecamp.json', 
            JSON.stringify(codecamp_data),
            function(err) {
                if (err) {
                    console.log(err);
                }
            });
    }, slide_interval);
    return clock;
}

var codecamp_file = fs.readFileSync('./codecamp.json');
var codecamp_data = JSON.parse(codecamp_file);
var clock = slide_clock(codecamp_data.slide_interval);

websocket_clients = {};
// Handle WebSocket connection
wss.on('connection', function connection(wsclient) {

    // Assign wsclient a unique id
    console.log("Socket Client Connected");
    wsclient.ws_id = uuidv4();
    websocket_clients[wsclient.ws_id] = "";

    // Load data from codecamp.json and send data
    var codecamp_file = fs.readFileSync('./codecamp.json');
    var codecamp_data = JSON.parse(codecamp_file);
    wsclient.send(JSON.stringify(codecamp_data), {binary: false });

    // Handle WebSocket messages
    wsclient.on('message', function (raw_data) {
        data = JSON.parse(raw_data);

        // Check if user is authenticated
        if (data.user_id == "") {
            console.log(`Unauthenticated user`);
        } else {
            var flag = false;
            model.User.findOne({_id: data.user_id}).then(function (user) {
                if (!user) {
                    console.log(`Unauthenticated user`);
                    flag = true;
                } else {
                    websocket_clients[data.ws_id] = user._id;
                    console.log(`User ${data.user_id} connected`);
                }
                if (!user["admin"]) {
                    console.log(`Unauthorized user, requires admin`);
                    flag = true;
                } else {
                    console.log(`User ${data.user_id} is a admin`);
                }

                // User is admin, Make changes and update all sockets
                if (!flag) {
                    // Save new data to codecamp.json and send new data
                    data.user_id = "";
                    data.ws_id = "";
                    fs.writeFile('./codecamp.json', JSON.stringify(data), function(err) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("Clock Stopped");
                            console.log("Data Saved");
                            clearInterval(clock);
                            if (!data.slide_show_paused) {
                                clock = slide_clock(data.slide_interval);
                            }
                        }
                    });

                    // Send a response back to all clients
                    wss.clients.forEach(function (client) {
                        if (client.readyState == WebSocket.OPEN) {
                            client.send(JSON.stringify(data), {binary: false });
                        }
                    });
                }
            });
        }
    });

    // Handle WebSocket disconnections
    wsclient.on('close', () => {
        console.log('WebSocket client disconnected');
    });
});