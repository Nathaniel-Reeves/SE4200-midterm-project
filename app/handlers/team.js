const model = require('../models/team');
const auth = require('../handlers/user');
const { User } = require('../models/user');

function team_handlers(app) {

    app.get("/teams", async (req, res) => {
        var catagory = req.query.catagory;
        var request = "GET /teams";
        if (catagory) {
            request += "?catagory=" + catagory;
        }
        console.log(request);
        try {
            if (catagory) {
                var teams = await model.Team.find(
                    { catagory: catagory}, {
                        team_members: {
                        email: 0,
                        password: 0
                    }
                })
                .populate('team_members', "-email -password")
                .populate('judge_scores')
                .exec();
                return res.status(200).json(teams);
            } else {
                var teams = await model.Team.find(
                    {}, {
                        team_members: {
                        email: 0,
                        password: 0
                    }
                })
                .populate('team_members', "-email -password")
                .populate('judge_scores')
                .exec();
                return res.status(200).json(teams);
            }
        } catch (error) {
            console.log(error);
            return res.status(500).send(JSON.stringify([{"message": "Something went wrong.","status":"error"}]));
        }
    });

    app.post("/teams", auth.authorizeSession(), auth.authorizeRoll("attendant"), async (req, res) => {
        console.log("POST /teams");
        console.log("BODY: ", req.body);

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
                return res.status(401).send(JSON.stringify([{"message": "Team already exists.","status":"error"}]));
            }
            console.log("Something went wrong.")
            console.log(error);
            return res.status(500).send(JSON.stringify([{"message": "Something went wrong.","status":"error"}]));
        }
    });

    app.post("/teams/:teamid/users/", auth.authorizeSession(), auth.authorizeRoll("attendant"), async (req, res) => { 
        console.log(`POST /teams/${req.params.teamid}/users`);
        console.log("BODY: ", req.body);
        // Check if the team exists.
        try {
            var team = await model.Team.findById(req.params.teamid).exec();
            if (!team) {
                console.log("Team does not exist.");
                return res.status(404).send(JSON.stringify([{"message": "Team does not exist.","status":"error"}]));
            }
            console.log("Team found.");
        } catch (error) {
            console.log(error);
            return res.status(422).send(JSON.stringify([{"message": "Invalid Team id.","status":"error"}]));
        }

        try {
            var user = await User.findById(req.body._id).exec();
            // Check if the user exists.
            if (!user) {
                console.log("User does not exist.");
                return res.status(404).send(JSON.stringify([{"message": "User does not exist.","status":"error"}]));
            }
            console.log("User found.");

            // Check if the user is a contestant
            if (!user.contestant) {
                console.log("User is not a contestant.");
                return res.status(401).send(JSON.stringify([{"message": "User is not a contestant.","status":"error"}]));
            }
            console.log("User is a contestant.");

            // Check if user is already part of a team
            var flag = await model.Team.find({ "team_members": user._id }).exec();
            if (flag.length > 0) {
                console.log("User is already part of a team.");
                return res.status(401).send(JSON.stringify([{"message": "User is already part of a team.","status":"error"}]));
            }
            console.log("User is not already part of a team.");
        } catch (error) {
            console.log(error);
            return res.status(422).send(JSON.stringify([{"message": "Invalid User id.","status":"error"}]));
        }
        
        // Add user to the team.
        try {
            model.Team.findByIdAndUpdate({ _id:req.params.teamid}, {$push: {team_members:req.body._id}}).exec();
            console.log("User added to team.");
            return res.status(201).send(JSON.stringify([{"message": "User added to team.","status":"ok"}]));
        } catch (error) {
            console.log(error);
            return res.status(500).send(JSON.stringify([{"message": "Something went wrong.","status":"error"}]));
        }
    });

    app.delete("/teams/:teamid/users", auth.authorizeSession(), auth.authorizeRoll("attendant"), async (req, res) => {
        console.log(`DELETE /teams/${req.params.teamid}/users`);
        console.log("BODY: ", req.body);
        // Check if the team exists.
        try {
            var team = await model.Team.findById(req.params.teamid).exec();
            if (!team) {
                console.log("Team does not exist.");
                return res.status(404).send(JSON.stringify([{"message": "Team does not exist.","status":"error"}]));
            }
            console.log("Team found.");
        } catch (error) {
            console.log(error);
            return res.status(422).send(JSON.stringify([{"message": "Invalid Team id.","status":"error"}]));
        }

        // Check if user is part of the team.
        const exists = await model.Team.findOne({ "_id": req.params.teamid,"team_members": req.body._id }).exec();
        if (!exists) {
            console.log("User is not part of the team.");
            return res.status(401).send(JSON.stringify([{"message": "User is not part of the team.","status":"error"}]));
        }
        console.log("User is part of the team.");

        // Remove user from the team.
        try {
            model.Team.findByIdAndUpdate({ _id:req.params.teamid}, {$pull: {team_members:req.body._id}}).exec();
            console.log("User removed from team.");
            return res.status(200).send(JSON.stringify([{"message": "User removed from team.","status":"ok"}]));
        } catch (error) {
            console.log(error);
            return res.status(500).send(JSON.stringify([{"message": "Something went wrong.","status":"error"}]));
        }
    });

    app.put("/teams/:teamid", auth.authorizeSession(), auth.authorizeRoll("attendant"), async (req, res) => {
        console.log(`PUT /teams/${req.params.teamid}`);
        console.log("BODY: ", req.body);
        // Check if the team exists.
        try {
            var team = await model.Team.findById(req.params.teamid).exec();
            if (!team) {
                console.log("Team does not exist.");
                return res.status(404).send(JSON.stringify([{"message": "Team does not exist.","status":"error"}]));
            }
            console.log("Team found.");
        } catch (error) {
            console.log(error);
            return res.status(422).send(JSON.stringify([{"message": "Invalid Team id.","status":"error"}]));
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
            return res.status(200).send(JSON.stringify([{"message": "Team updated.","status":"ok"}]));
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
    });

    app.delete("/teams/:teamid", auth.authorizeSession(), auth.authorizeRoll("attendant"), async (req, res) => {
        console.log(`DELETE /teams/${req.params.teamid}`);
        console.log("BODY: ", req.body);
        // Check if the team exists.
        try {
            var team = await model.Team.findById(req.params.teamid).exec();
            if (!team) {
                console.log("Team does not exist.");
                return res.status(404).send(JSON.stringify([{"message": "Team does not exist.","status":"error"}]));
            }
            console.log("Team found.");
        } catch (error) {
            console.log(error);
            return res.status(422).send([{"message": "Invalid Team id.","status":"error"}]);
        }

        // Delete team.
        try {
            await model.Team.findByIdAndRemove(req.params.teamid).exec();
            console.log("Team deleted.");
            return res.status(200).send(JSON.stringify([{"message": "Team deleted.","status":"ok"}]));
        } catch (error) {
            console.log(error);
            return res.status(500).send(JSON.stringify([{"message": "Something went wrong.","status":"error"}]));
        }
    });
}

module.exports = {
    team_handlers
};