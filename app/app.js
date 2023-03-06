const express = require('express');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const cors = require('cors');

app = express();

const { ConnectionClosedEvent } = require('mongodb');

// Setup sessions
app.use(express.static(__dirname+'/views'));
const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false
}));
app.use(cookieParser());

// tack on middleware
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    console.log(session);
    res.setHeader('Access-Control-Allow-Origin','*')
    console.log("GET /")
    res.render('index.html');
});

require('./handlers/user').user_handlers(app);
require('./handlers/judge_score').judge_score_handlers(app);
require('./handlers/team').team_handlers(app);

app.listen(8080, function () {
    console.log('Codecamp app listening on port 8080!');
});