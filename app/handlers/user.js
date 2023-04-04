const model = require('../models/user');

function authorizeSession() {
    return function (req, res, next) {
        if (req.session && req.session.user) {
            model.User.findOne({_id: req.session.user._id}).then(function (user) {
                if (user) {
                    req.session.user = user;
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

function authorizeRoll(roll) {
    return function (req, res, next) {
        console.log(req.session.user);
        if (req.session.user[roll]) {
            next();
        } else {
            console.log(`Unauthorized user, requires ${roll}`);
            res.status(401).send(JSON.stringify([{"message":`Unauthorized user, requires ${roll}`,"status":"error"}]));
        }
    };
}


function user_handlers(app) {

    app.post('/session', async (req, res) => {
        console.log("POST - /session")
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
                    req.session.user = user;
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

    app.get('/session', function (req, res) {
        console.log("GET - /session");
        console.log("The current session data:", req.session);
        res.json(req.session);
    });

    app.delete("/session", authorizeSession(), function (req, res) {
        console.log("DELETE - /session");
        // TODO: call this function from the client to log out.  Document this code.
        req.session.user = undefined;
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
    app.put('/toggle-user-roll/:userid', authorizeSession(), authorizeRoll("admin"), async (req, res) => {
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

module.exports = {
    user_handlers,
    authorizeSession,
    authorizeRoll
}