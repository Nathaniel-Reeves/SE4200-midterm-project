const express = require('express');
const cookieParser = require("cookie-parser");
const session = require('express-session');
const cors = require('cors');

const User = require('./app/models/user');

app = express();

const { ConnectionClosedEvent } = require('mongodb');

const port = process.env.PORT || 8080;

// Setup sessions
app.use(express.static(__dirname+'/views'));
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

// custom authorizedRequest middleware function called by
// express for each request recived.
function authorizeRequest(req, res, next) {
    if (req.session && req.session.userid) {
        User.findeOne({_id: req.session.userId}).then(function (user) {
            if (user) {
                // forward the results from the database query to the request
                req.user = user;
                next();
            } else {
                res.status(401).send("Unauthenticated");
            }  
        });
    } else {
        res.status(401).send("Unauthenticated");
    }
}


app.get('/', (req, res) => {
    console.log(session);
    session=req.session;
    console.log("GET /")
    res.render('index.html');
});

require('./app/handlers/user').user_handlers(app);
require('./app/handlers/judge_score').judge_score_handlers(app);
require('./app/handlers/team').team_handlers(app);

app.listen(port, function () {
    console.log(`Codecamp app listening on port ${port}!`);
});