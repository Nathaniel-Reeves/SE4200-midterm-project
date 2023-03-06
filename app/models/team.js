const validator = require("validator");
const mongoose = require('./mongoose_conf');
const { User } = require('../models/user');

// Define the teams schema
const teamSchema = new mongoose.Schema({
    team_name: {
        type: String,
        required: [true, 'Team name is required'],
        minlength: [3, "Team name must be at least 3 characters long"],
        maxlength: [200, "Team name must be less than 200 characters long"],
    },
    team_division: {
        type: String,
        enum: ["industry", "intermediate", "novice", "rookie", "rookie_day_camp"],
        defalut: "rookie_day_camp",
        required: [true, "Team division is required"],
    },
    team_members: [
        {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
    ],
    catagory: {
        type: String,
        enum: ["App", "Game", "Maker", "Rookie", "Rookie Starter Kit", "Rookie Jr Starter Kit", "Lego League"],
        default: "App",
        required: [true, "Catagory is required"],
    },
    judge_scores: [
        {type: mongoose.Schema.Types.ObjectId, ref: 'JudgeScore'}
    ]
});

teamSchema.pre('save', function(next) {
    var team = this;

    // If the team is empty, skip checks
    if (team.team_members.length === 0) {
        next();
    }

    // Check that the team members are candidates
    for (let i = 0; i < team.team_members.length; i++) {
        User.findById(team.team_members[i], function(err, user) {
            if (user.candidate) {
                next();
            } else {
                next(new Error(`The user ${user.first_name} ${user.last_name} is not a candidate.`));
            }
        });
    }
})

const Team = mongoose.model("Team", teamSchema);

module.exports = {
    Team:Team
};
