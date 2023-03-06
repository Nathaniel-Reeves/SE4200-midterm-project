const model = require('../models/judge_score');
const user_helper = require('../handlers/user');
const { User } = require('../models/user');
const { Team } = require('../models/team');
const mongoose = require('../models/mongoose_conf');

function judge_score_handlers(app) {
    app.post('/team/:teamid/judge_score', async (req, res) => {
        console.log(`POST /team/${req.params.teamid}/judge_score`);
        console.log("BODY: ", req.body);
        user_helper.valid_user_roll(req, res, "judge").then(async flag => {
            if (flag) {
                // Check if the team exists.
                try {
                    var team = await Team.findById(req.params.teamid).exec();
                    if (!team) {
                        console.log("Team does not exist.");
                        return res.status(404).send("Team does not exist.");
                    }
                    console.log("Team found.");
                } catch (error) {
                    console.log(error);
                    return res.status(422).send("Invalid Team id.");
                }

                // Get the id of the Judge.
                const userid = await User.findOne({ email: req.session.userid });

                // Check if the judge has already submitted a score for this team.
                var judge_score = await model.JudgeScore.findOne({
                    teamId: req.params.teamid,
                    judgeId: userid
                }).exec();
                if (judge_score) {
                    console.log("Judge has already scored this team.");
                    return res.status(409).send("Judge has already scored this team.");
                }
                console.log("Judge score does not exist for this team.");

                // Start transaction.
                const session = await mongoose.startSession();
                session.startTransaction();

                // Create Judge Score Record.
                try {
                    var new_judge_score = new model.JudgeScore({
                        teamId: req.params.teamid,
                        judgeId: userid,
                        uniqueness_score: req.body.uniqueness_score,
                        commercial_viability_score: req.body.commercial_viability_score,
                        aethetic_score: req.body.aethetic_score,
                        completeness_score: req.body.completeness_score,
                        level_of_complexity_score: req.body.level_of_complexity_score,
                        criticisms: req.body.criticisms,
                        acclaims: req.body.acclaims
                    });
                    await new_judge_score.save();
                } catch (error) {
                    if (error.name === "ValidationError") {
                        let errors = {};
                        Object.keys(error.errors).forEach(key => {
                            errors[key] = error.errors[key].message;
                        });
                        console.log("Validation errors: ", errors);
                        return res.status(400).send(errors);
                    }
                }

                // get the auto generated id of the new judge score record
                var new_judge_score = await model.JudgeScore.findOne({
                    teamId: req.params.teamid,
                    judgeId: userid
                }).exec();
                if (new_judge_score) {
                    console.log("New judge score record created.");
                    var record_id = new_judge_score._id;
                } else {
                    console.log("New judge score record not created.");
                    session.abortTransaction();
                    return res.status(409).send("New judge score record not created.");
                }

                // Add new score record to team.
                try {
                    await Team.findByIdAndUpdate({ _id:req.params.teamid}, {$push: {judge_scores:record_id}}).exec();
                    console.log("New score record added to team.");
                    session.commitTransaction();
                    return res.status(201).send("New score record added to team.");
                } catch (error) {
                    console.log(error);
                    session.abortTransaction();
                    return res.status(500).send("Something went wrong.");
                }
            }
        }).catch((error) => {
            console.log('Bad Request: Invalid user id.');
            console.log(error);
            return res.status(422).send('Bad Request: Invalid user id.');
        });
    });

    app.delete('/team/:teamid/judge_score', async (req, res) => {
        console.log(`DELETE /team/${req.params.teamid}/judge_score`);
        console.log("BODY: ", req.body);
        user_helper.valid_user_roll(req, res, "judge").then(async flag => {
            if (flag) {
                // Check if the team exists.
                try {
                    var team = await Team.findById(req.params.teamid).exec();
                    if (!team) {
                        console.log("Team does not exist.");
                        return res.status(404).send("Team does not exist.");
                    }
                    console.log("Team found.");
                } catch (error) {
                    console.log(error);
                    return res.status(422).send("Invalid Team id.");
                }

                // Get the id of the Judge.
                const userid = await User.findOne({ email: req.session.userid });

                // Start transaction.
                const session = await mongoose.startSession();
                session.startTransaction();

                // get score record id
                var judge_score = await model.JudgeScore.findOne({
                    teamId: req.params.teamid,
                    judgeId: userid
                }).exec();
                if (!judge_score) {
                    console.log("Judge score does not exist for this team.");
                    session.abortTransaction();
                    return res.status(404).send("Judge score does not exist for this team.");
                } else {
                    var record_id = judge_score._id;
                }

                // Check if the judge has already submitted a score for this team, if so, delete the score record.
                try {
                    await model.JudgeScore.findOneAndDelete({
                        teamId: req.params.teamid,
                        judgeId: userid
                    }).exec();
                    console.log("Judge score record deleted.");
                } catch (error) {
                    console.log("Judge has not scored this team.");
                    console.log(error);
                    session.abortTransaction();
                    return res.status(409).send("Judge has not scored this team.");
                }

                // Delete judge score from the team.
                try {
                    await Team.findByIdAndUpdate({ _id:req.params.teamid}, {$pull: {judge_scores:record_id}}).exec();
                    console.log("Judge score record deleted from team.");
                    session.commitTransaction();
                    return res.status(200).send("Judge score record deleted.");
                } catch (error) {
                    console.log(error);
                    session.abortTransaction();
                    return res.status(500).send("Something went wrong.");
                }
            }
        }).catch((error) => {
            console.log('Bad Request: Invalid user id.');
            console.log(error);
            return res.status(422).send('Bad Request: Invalid user id.');
        });
    });

    app.put('/team/:teamid/judge_score', async (req, res) => {
        console.log(`PUT /team/${req.params.teamid}/judge_score`);
        console.log("BODY: ", req.body);
        user_helper.valid_user_roll(req, res, "judge").then(async flag => {
            if (flag) {
                // Check if the team exists.
                try {
                    var team = await Team.findById(req.params.teamid).exec();
                    if (!team) {
                        console.log("Team does not exist.");
                        return res.status(404).send("Team does not exist.");
                    }
                    console.log("Team found.");
                } catch (error) {
                    console.log(error);
                    return res.status(422).send("Invalid Team id.");
                }

                // Get the id of the Judge.
                const userid = await User.findOne({ email: req.session.userid });

                // Check if the judge has already submitted a score for this team.
                var judge_score = await model.JudgeScore.findOne({
                    teamId: req.params.teamid,
                    judgeId: userid
                }).exec();
                if (!judge_score) {
                    console.log("Judge score does not exist for this team.");
                    return res.status(409).send("Judge has already scored this team.");
                }
                console.log("Judge has scored this team.");

                // Update the Judge score record.
                try {
                    await model.JudgeScore.findOneAndUpdate({
                        teamId: req.params.teamid,
                        judgeId: userid
                    }, {
                        $set: {
                            uniqueness_score: req.body.uniqueness_score,
                            commercial_viability_score: req.body.commercial_viability_score,
                            aethetic_score: req.body.aethetic_score,
                            completeness_score: req.body.completeness_score,
                            level_of_complexity_score: req.body.level_of_complexity_score,
                            criticisms: req.body.criticisms,
                            acclaims: req.body.acclaims
                        }
                    }, {new: true, runValidators: true}).exec();
                    console.log("Judge score record updated.");
                    return res.status(200).send("Judge score record updated.");
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
    judge_score_handlers
}