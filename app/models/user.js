const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10;
const validator = require("validator");
const mongoose = require('./mongoose_conf');

// Define the user schema
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email is a required field"],
        trim: true,
        lowercase: true,
        unique: true,
        index: { unique: true },
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Please enter a valid E-mail!");
            }
        },
    },
    password: {
        type: String,
        required: [true, "Password is a required field"],
        validate(value) {
            if (!validator.isLength(value, { min: 6, max: 1000 })) {
                throw Error("Length of the password should be between 6-1000");
            }

            if (value.toLowerCase().includes("password")) {
                throw Error('The password should not contain the keyword "password"!');
            }
        },
    },
    first_name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        required: true,
    },
    admin: {
        type: Boolean,
        default: false
    },
    contestant: {
        type: Boolean,
        default: true
    },
    judge: {
        type: Boolean,
        default: false
    },
    attendant: {
        type: Boolean,
        default: false
    }
});

userSchema.pre('save', function(next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

// Define the user model
const User = mongoose.model('User', userSchema);

module.exports = {
    User:User
};

