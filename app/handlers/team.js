const model = require('../models/team');
const user_helper = require('../handlers/user');
const { User } = require('../models/user');

function team_handlers(app) {
    app.post("/teams", async (req, res) => {
        console.log("POST /teams");
        console.log("BODY: ", req.body);

        user_helper.valid_user_roll(req, res, "attendant").then(flag => {
            if (flag) {
                try {
                    const newTeam = new model.Team(req.body);
                    newTeam.save().then(newTeam => {
                        console.log("New team saved.");
                        return res.status(201).send(newTeam);
                    });
                } catch (error) {
                    if (error.name === "ValidationError") {
                        let errors = {};

                        Object.keys(error.errors).forEach((key) => {
                            errors[key] = error.errors[key].message;
                        });
                        console.log("Validation errors: ", errors);
                        return res.status(400).send(errors);
                    }
                    if (error.code === 11000) {
                        console.log("Team already exists.");
                        return res.status(401).send("Team already exists.");
                    }
                    console.log("Something went wrong.")
                    console.log(error);
                    return res.status(500).send("Something went wrong.");
                }
            }
        }).catch((error) => {
            console.log('Bad Request: Invalid user id.');
            console.log(error);
            return res.status(422).send('Bad Request: Invalid user id.');
        });
    });

    app.post("/teams/:teamid/users/", async (req, res) => { 
        console.log(`POST /teams/${req.params.teamid}/users`);
        console.log("BODY: ", req.body);
        user_helper.valid_user_roll(req, res, "attendant").then(async flag => {
            if (flag) {
                // Check if the team exists.
                try {
                    var team = await model.Team.findById(req.params.teamid).exec();
                    if (!team) {
                        console.log("Team does not exist.");
                        return res.status(404).send("Team does not exist.");
                    }
                    console.log("Team found.");
                } catch (error) {
                    console.log(error);
                    return res.status(422).send("Invalid Team id.");
                }

                try {
                    var user = await User.findById(req.body._id).exec();
                    // Check if the user exists.
                    if (!user) {
                        console.log("User does not exist.");
                        return res.status(404).send("User does not exist.");
                    }
                    console.log("User found.");

                    // Check if the user is a contestant
                    if (!user.contestant) {
                        console.log("User is not a contestant.");
                        return res.status(401).send("User is not a contestant.");
                    }
                    console.log("User is a contestant.");

                    // Check if user is already part of a team
                    var flag = await model.Team.find({ "team_members": user._id }).exec();
                    if (flag.length > 0) {
                        console.log("User is already part of a team.");
                        return res.status(401).send("User is already part of a team.");
                    }
                    console.log("User is not already part of a team.");
                } catch (error) {
                    console.log(error);
                    return res.status(422).send("Invalid User id.");
                }
                
                // Add user to the team.
                try {
                    model.Team.findByIdAndUpdate({ _id:req.params.teamid}, {$push: {team_members:req.body._id}}).exec();
                    console.log("User added to team.");
                    return res.status(201).send("User added to team.");
                } catch (error) {
                    console.log(error);
                    return res.status(500).send("Something went wrong.");
                }
            }
        }).catch((error) => {
            console.log('Bad Request: Invalid user id.');
            console.log(error);
            return res.status(422).send('Bad Request: Invalid user id.');
        });
    });

    app.delete("/teams/:teamid/users", async (req, res) => {
        console.log(`DELETE /teams/${req.params.teamid}/users`);
        console.log("BODY: ", req.body);
        user_helper.valid_user_roll(req, res, "attendant").then(async flag => {
            if (flag) {
                // Check if the team exists.
                try {
                    var team = await model.Team.findById(req.params.teamid).exec();
                    if (!team) {
                        console.log("Team does not exist.");
                        return res.status(404).send("Team does not exist.");
                    }
                    console.log("Team found.");
                } catch (error) {
                    console.log(error);
                    return res.status(422).send("Invalid Team id.");
                }

                // Check if user is part of the team.
                const exists = await model.Team.findOne({ "_id": req.params.teamid,"team_members": req.body._id }).exec();
                if (!exists) {
                    console.log("User is not part of the team.");
                    return res.status(401).send("User is not part of the team.");
                }
                console.log("User is part of the team.");

                // Remove user from the team.
                try {
                    model.Team.findByIdAndUpdate({ _id:req.params.teamid}, {$pull: {team_members:req.body._id}}).exec();
                    console.log("User removed from team.");
                    return res.status(200).send("User removed from team.");
                } catch (error) {
                    console.log(error);
                    return res.status(500).send("Something went wrong.");
                }
            }

        }).catch((error) => {
            console.log('Bad Request: Invalid user id.');
            console.log(error);
            return res.status(422).send('Bad Request: Invalid user id.');
        });
    });

    app.put("/teams/:teamid", async (req, res) => {
        console.log(`PUT /teams/${req.params.teamid}`);
        console.log("BODY: ", req.body);
        user_helper.valid_user_roll(req, res, "attendant").then(async flag => {
            if (flag) {
                // Check if the team exists.
                try {
                    var team = await model.Team.findById(req.params.teamid).exec();
                    if (!team) {
                        console.log("Team does not exist.");
                        return res.status(404).send("Team does not exist.");
                    }
                    console.log("Team found.");
                } catch (error) {
                    console.log(error);
                    return res.status(422).send("Invalid Team id.");
                }

                // Update team attributes.
                try {
                    await model.Team.findByIdAndUpdate(
                        { _id:req.params.teamid}, 
                        {
                            team_name: req.body.team_name, 
                            team_division: req.body.team_division, 
                            catagory: req.body.catagory
                        },
                        {new: true, runValidators: true}).exec();
                    console.log("Team updated.");
                    return res.status(200).send("Team updated.");
                } catch (error) {
                    if (error.name === "ValidationError") {
                        let errors = {};

                        Object.keys(error.errors).forEach((key) => {
                            errors[key] = error.errors[key].message;
                        });
                        console.log("Validation errors: ", errors);
                        return res.status(400).send(errors);
                    } 
                }
            }
        }).catch((error) => {
            console.log('Bad Request: Invalid user id.');
            console.log(error);
            return res.status(422).send('Bad Request: Invalid user id.');
        });
    });

    app.delete("/teams/:teamid", async (req, res) => {
        console.log(`DELETE /teams/${req.params.teamid}`);
        console.log("BODY: ", req.body);
        user_helper.valid_user_roll(req, res, "attendant").then(async flag => {
            if (flag) {
                // Check if the team exists.
                try {
                    var team = await model.Team.findById(req.params.teamid).exec();
                    if (!team) {
                        console.log("Team does not exist.");
                        return res.status(404).send("Team does not exist.");
                    }
                    console.log("Team found.");
                } catch (error) {
                    console.log(error);
                    return res.status(422).send("Invalid Team id.");
                }

                // Delete team.
                try {
                    await model.Team.findByIdAndRemove(req.params.teamid).exec();
                    console.log("Team deleted.");
                    return res.status(200).send("Team deleted.");
                } catch (error) {
                    console.log(error);
                    return res.status(500).send("Something went wrong.");
                }
            }
        }).catch((error) => {
            console.log('Bad Request: Invalid user id.');
            console.log(error);
            return res.status(422).send('Bad Request: Invalid user id.');
        });
    });
}

module.exports = {
    team_handlers
};