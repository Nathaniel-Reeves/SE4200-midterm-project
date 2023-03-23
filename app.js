const express = require('express');
const cookieParser = require("cookie-parser");
const session = require('express-session');
const cors = require('cors');

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
app.use(cors());

// custom authorizedRequest middleware function called by
// express for each request recived.
function authorizeRequest(req, res, next) {
    if (req.session && req.session.userid){
        //TODO: query the user in the database and check if they exsist
        if (user) {
            // forward the results from the database query to the request
            req.user = user;
            next();
        } else {
            res.status(401).send("Unauthenticated");
        }  
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

require('./handlers/user').user_handlers(app);
require('./handlers/judge_score').judge_score_handlers(app);
require('./handlers/team').team_handlers(app);

app.listen(port, function () {
    console.log(`Codecamp app listening on port ${port}!`);
});