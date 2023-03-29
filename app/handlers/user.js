const model = require('../models/user');

function user_handlers(app) {

    // First order function, function that builds functions
    // Notes from Class - User must be administrator
    function authorizeRequest(adminOnly) {
        return function () {
            if (req.session && req.session.userId) {
                model.User.findeOne({_id: req.session.userId}).then(function (user) {
                    if (user && user.admin || user && !adminOnly) {
                        req.user = user;
                        next();
                    } else {
                        res.status(401).send("Unauthenticated");
                    }
                });
            } else {
                res.status(401).send("Unathenticated");
            }
        };
    }

    // example
    // app.get('/foods', autorizeRequest(false), function (req, res) ...

    app.get('/logout',(req,res) => {
        console.log("GET /logout");
        req.session.userid = null;
        req.session.loggedin = false;
        res.redirect('/');
    });

    app.post('/login', async (req, res) => {
        console.log("POST /login")
        console.log("BODY: ", req.body);
        try {
            const user = await model.User.findOne({ email: req.body.email }).exec();
            if (!user) {
                console.log("User not found");
                return res.status(401).send(JSON.stringify([{"message": "User not found.","status":"error"}]));
            }
            await user.comparePassword(req.body.password, function(err, isMatch) {
                if (err) throw err;
                if (isMatch) {
                    // Save user authentacated session state on the server
                    // TODO: reconfigure the client to use the new session cookies properly 
                    session=req.session;
                    session.userid = user._id;
                    req.session.loggedin = true;
                    req.session.userid = user._id;
                    req.session.email = user.email;
                    req.session.first_name = user.first_name;
                    req.session.last_name = user.last_name;
                    req.session.admin = user.admin;
                    req.session.contestant = user.contestant;
                    req.session.judge = user.judge;
                    req.session.attendant = user.attendant;
                    return res.status(201).send(user);
                } else {
                    console.log("Invalid password");
                    return res.status(401).send(JSON.stringify([{"message": "Wrong password.","status":"error"}]));
                }
            });
        } catch (err) {
            res.status(500).send(err);
            throw err;
        }
    });

    app.get('/login', async (req, res) => {
        // TODO: document this function and call it on the client.
        console.log("GET /login");
        if (req.session.loggedin) {
            return res.redirect('/');
        }
        
    });

    app.get('/session',authorizeRequest, function (req, res) {
        // TODO: Convert login to session, use this function to check if the user is logged in for each page load
        console.log("The current session data:", req.session);
        res.json(req.user);
    });

    app.delete("/session", authorizeRequest, function (req, res) {
        // TODO: call this function from the client to log out.  Document this code.
        req.session.userId = undefined;
        res.status(204).send("Logged Out");
    });

    app.post('/register', async (req, res) => {
        console.log("POST - /register");
        console.log("BODY: ", req.body);

        try {
            var newUser = new model.User(req.body);
            await newUser.save();
            return res.status(201).send([{"message": "User created successfully", "status": "ok"}]);
        } catch (error) {
            if (error.name === "ValidationError") {
                let errors = [];

                Object.keys(error.errors).forEach((key) => {
                    errors.push({"message":error.errors[key].message, "status":"error"});
                });
                console.log(errors);
                return res.status(400).send(JSON.stringify(errors));
            }
            if (error.code === 11000) {
                // User already exists
                return res.status(401).send(JSON.stringify([{"message":"User already exists.","status":"error"}]));
            }
            console.log("Something went wrong.")
            return res.status(500).send(JSON.stringify([{"message":"Something went wrong.","status":"error"}]));
        }
    });

    // TODO: refigure the authorizeRequest middleware function to with this this function and all other functions
    app.put('/toggle-user-roll/:userid', authorizeRequest, async (req, res) => {
        console.log("PUT /toggle-user-roll");
        console.log("BODY: ", req.body);
        valid_user_roll(req, res, "admin").then(flag => {
            if (flag) {
                console.log("Updating user roll.")
                model.User.findOne({ _id: req.params.userid }).then( user => {
                    if (user) {
                        user.admin_user = req.body.admin_user;
                        user.contestant_user = req.body.contestant_user;
                        user.judge_user = req.body.judge_user;
                        user.attendant_user = req.body.attendant_user;
                        user.save().then(() => {
                            console.log("User roll updated.");
                            return res.status(201).send(JSON.stringify([{"message":"User roll updated.","status":"ok"}]));
                        });
                    } else {
                        console.log("User not found.");
                        return res.status(404).send(JSON.stringify([{"message":"User not found.","status":"error"}]));
                    }
                }).catch(() => {
                    console.log("Bad Request: Invalid user id.");
                    return res.status(400).send(JSON.stringify([{"message":"Bad Request: Invalid user id.","status":"error"}]));
                });
            }
        });
    });
}

async function valid_user_roll(req, res, roll) {
    // roll is a string deffined as "admin", "contestant", "judge", or "attendant"
    try {
        if (!req.session.loggedin) {
            console.log(`${roll} session required, not logged in.`);
            res.status(401).send(JSON.stringify([{"message":`${roll} session required, not logged in.`,"status":"error"}]));
            return false;
        }
        var email = req.session.userid;
        const user = await model.User.findOne({ email: email });
        if (!user) {
            console.log(`${roll} user not found`);
            res.status(404).send(JSON.stringify([{"message":`${roll} user not found`,"status":"error"}]));
            return false;
        } else {
            if (!user[roll]) {
                console.log(`Unauthorized user, requires ${roll}`);
                res.status(401).send(JSON.stringify([{"message":`Unauthorized user, requires ${roll}`,"status":"error"}]));
                return false;
            } else {
                console.log("Authorized User.");
                return true;
            }
        }
    } catch (err) {
        console.log("Error in valid_user_roll: ", err);
        res.status(500).send(JSON.stringify([{"message":"Something went wrong.","status":"error"}]));
        return false;
    }
}

module.exports = {
    user_handlers,
    valid_user_roll
}