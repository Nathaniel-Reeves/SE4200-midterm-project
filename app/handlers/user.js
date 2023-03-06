const model = require('../models/user');

function user_handlers(app) {

    app.get('/logout',(req,res) => {
        res.setHeader('Access-Control-Allow-Origin','*')
        console.log("GET /logout");
        req.session.destroy();
        res.redirect('/');
    });

    app.post('/login', async (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*')
        console.log("POST /login")
        console.log("BODY: ", req.body);
        try {
            const user = await model.User.findOne({ email: req.body.email }).exec();
            if (!user) {
                console.log("User not found");
                return res.status(404).send("User not found.");
            }
            await user.comparePassword(req.body.password, function(err, isMatch) {
                if (err) throw err;
                if (isMatch) {
                    req.session.loggedin = true;
                    req.session.userid = req.body.email;
                    console.log(user);
                    return res.status(200).send(user);
                } else {
                    console.log("Invalid password");
                    return res.status(401).send("Wrong password.");
                }
            });
        } catch (err) {
            throw err;
        }
    });

    app.post('/register', async (req, res) => {
        res.setHeader('Access-Control-Allow-Origin','*')
        console.log("POST - /register");
        console.log("BODY: ", req.body);

        try {
            var newUser = new model.User(req.body);
            await newUser.save();
            return res.status(200).send(newUser);
        } catch (error) {
            if (error.name === "ValidationError") {
                let errors = {};

                Object.keys(error.errors).forEach((key) => {
                    errors[key] = error.errors[key].message;
                });
                console.log(errors);
                return res.status(400).send(errors);
            }
            if (error.code === 11000) {
                // User already exists
                return res.status(401).send("User already exists.");
            }
            console.log("Something went wrong.")
            return res.status(500).send("Something went wrong.");
        }
    });

    app.put('/toggle-user-roll/:userid', async (req, res) => {
        res.setHeader('Access-Control-Allow-Origin','*')
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
                            return res.status(201).send("User roll updated.");
                        });
                    } else {
                        console.log("User not found.");
                        return res.status(404).send("User not found.");
                    }
                }).catch(() => {
                    console.log("Bad Request: Invalid user id.");
                    return res.status(400).send("Bad Request: Invalid user id.");
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
            res.status(401).send(`${roll} session required, not logged in.`);
            return false;
        }
        var email = req.session.userid;
        const user = await model.User.findOne({ email: email });
        if (!user) {
            console.log(`${roll} user not found`);
            res.status(404).send(`${roll} user not found`);
            return false;
        } else {
            if (!user[roll]) {
                console.log(`Unauthorized user, requires ${roll}`);
                res.status(401).send(`Unauthorized user, requires ${roll}`);
                return false;
            } else {
                console.log("Authorized User.");
                return true;
            }
        }
    } catch (err) {
        console.log("Error in valid_user_roll: ", err);
        res.status(500).send("Something went wrong.");
        return false;
    }
}

module.exports = {
    user_handlers,
    valid_user_roll
}