const validator = require("validator");
const mongoose = require('./mongoose_conf');
const { User } = require('../models/user');

// Define judge score record schema
const judgeScoreSchema = new mongoose.Schema({
    judgeId: {type: mongoose.Schema.Types.ObjectId, requred: true, ref:"User"},
    teamId: {type: mongoose.Schema.Types.ObjectId, requred: true, ref:"Team"},
    uniqueness_score: {
        type: Number,
        required: [true, "The uniqueness score is required."],
        min: [1, "The uniqueness score must be greater than or equal to 1."],
        max: [5, "The uniqueness score must be less than or equal to 5."],
        validate : {
            validator : Number.isInteger,
            message   : '{VALUE} is not a whole numnber.'
        },
        integer: [true, "The uniqueness score must be an whole number."]
    },
    commercial_viability_score: {
        type: Number,
        required: [true, "The commercial viability score is required."],
        min: [1, "The commercial viability score must be greater than or equal to 1."],
        max: [5, "The commercial viability score must be less than or equal to 5."],
        validate : {
            validator : Number.isInteger,
            message   : '{VALUE} is not a whole numnber.'
        },
        integer: [true, "The commercial viability score must be an whole number."]
    },
    aethetic_score: {
        type: Number,
        required: [true, "The aethetic score is required."],
        min: [1, "The aethetic score must be greater than or equal to 1."],
        max: [5, "The aethetic score must be less than or equal to 5."],
        validate : {
            validator : Number.isInteger,
            message   : '{VALUE} is not a whole numnber.'
        },
        integer: [true, "The aethetic score must be an whole number."]
    },
    completeness_score: {
        type: Number,
        required: [true, "The completeness score is required."],
        min: [1, "The completeness score must be greater than or equal to 1."],
        max: [5, "The completeness score must be less than or equal to 5."],
        validate : {
            validator : Number.isInteger,
            message   : '{VALUE} is not a whole numnber.'
        },
        integer: [true, "The completeness score must be an whole number."]
    },
    level_of_complexity_score: {
        type: Number,
        required: [true, "The level of complexity score is required."],
        min: [1, "The level of complexity score must be greater than or equal to 1."],
        max: [5, "The level of complexity score must be less than or equal to 5."],
        validate : {
            validator : Number.isInteger,
            message   : '{VALUE} is not a whole numnber.'
        },
        integer: [true, "The level of complexity score must be an whole number."]
    },
    criticisms: [{type: String}],
    acclaims: [{type: String}]
});

judgeScoreSchema.index({judgeId: 1, teamId: 1}, {unique: true});

const JudgeScore = mongoose.model("JudgeScore", judgeScoreSchema);

module.exports = {
    JudgeScore:JudgeScore
};