# SE4200-midterm-project
Web II midterm project.  A simple web app to help teams and judges at codecamp.

Here is the deployed application link:
http://codecamp2.us-east-1.elasticbeanstalk.com//

If you would like to explore the app without creating an account, here are some credentials you can use.

### All permissions

```json
{
    "email": "mark@example.com",
    "password": "secretword",
    "first_name": "Mark",
    "last_name": "Johnson",
    "judge": true,
    "admin": true,
    "attendant": true,
    "contestant": true
}
```

### Judge permissions only

```json 
{
    "email": "jane@example.com",
    "password": "myasdfsadfsd",
    "first_name": "Jane",
    "last_name": "Smith",
    "judge": true
}

```


### Contestant permissions only

```json
{
    "email": "amy@example.com",
    "password": "letmein",
    "first_name": "Amy",
    "last_name": "Brown",
    "contestant": true
}
```

All user passwords are stored as encrypted hashes using bcrypt.

## Websocket Connection

This app useses a websocket to update the timer and presentation slides to each client.  Changes to the timer and presentation slides are only accessible through a admin account login.  Once a admin account is logged in, a admin console page will become available to the user with all the UI elements to make changes to the presentation and timer.

## Visual Design Process

I used Figma to create the wireframe and story board for this project. 
Here is a link to the figma project page for your viewing.  I figured this would be easiest to do instead of a bunch of PDF files.

Figma Project: https://www.figma.com/file/lhDovqDS1JVYKGXaRlAbHK/Code-Camp-Score-Tool?node-id=14%3A214&t=yTIbnXjVogmyr1Ly-1

Prototype: https://www.figma.com/proto/lhDovqDS1JVYKGXaRlAbHK/Code-Camp-Score-Tool?node-id=20%3A1047&scaling=min-zoom&page-id=0%3A1&starting-point-node-id=1%3A2


## Data Resources

I used three resources to implement this app. 

1. Users
1. Teams
1. JudgeScore

Here is the Schema for each resource.

``` javascript

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
                throw {"message":"Length of the password should be between 6-1000","status":"error"};
            }

            if (value.toLowerCase().includes("password")) {
                throw {"message":'The password should not contain the keyword "password"!',"status":"error"};
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
        enum: ["app", "game", "maker", "rookie", "rookie_starter_kit", "rookie_jr_starter_kit", "lego_league"],
        default: "App",
        required: [true, "Catagory is required"],
    },
    judge_scores: [
        {type: mongoose.Schema.Types.ObjectId, ref: 'JudgeScore'}
    ]
});

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

```

## REST Endpoints

All data resources send and recive json requests only.

| Method | Path | Notes |
|-|-|-|
|Users|
|-|-|-|
|DELETE|/session|Logout User.|
|POST|/session|Login in User with email and password.|
|GET|/session|Get session data.|
|POST|/register|Creates a new user with email, first and last name, and password.|
|PUT|/toggle-user-roll/{:user_id}|This would only be accessible by users with admin privileges.  This allows the admin user to change the rolls of other users from contestants to judges to attendants|
|-|-|-|
|Teams|
|-|-|-|
|POST|/teams|Creates a new Team, attendants or admins can do this.  Takes a team_name, team_division, and catagory variables.|
|POST|/teams/{team_id}/users/ | Adds a user to a team, attendants and admins can do this.  sends a single user id.
|DELETE| /teams/{team_id}/users/ | Removes a user from a team.  Again, only admins and attendants can preform this action. |
|PUT| /teams/{team_id}/ | Allows admins and attendants to change team attributes such as the name, division, and catagory variables|
|DELETE| /teams/{team_id}/ | Deletes an entire team. Only admins and attendents can do this.|
|GET| /teams/ | Returns all teams with all user and judge_score information populated in one bulk response excluding emails and encrypted passwords. |
|-|-|-|
|JudgeScore|
|-|-|-|
|POST|/teams/{team_id}/judge_score/| Adds a judge score to a team.  Only Judges can use this endpoint.  Submits a Uniqueness score, commercial viability score, aethetic score, completeness score, and level of complecity score.  Judges can also submit a group of criticisms strings and acclaims strings to give the contestants more details. |
|DELETE| /teams/{team_id}/judge_score/ |Deletes a judge score entry for a team.
|PUT|/teams/{team_id}/judge_score/| Updates a judge score entry for a team.
|-|-|-|
| Pages |
|-|-|-|
|GET| / | returns the home page of the app. |

I intended to do more with the pages part of this app however I didn't get around to completeing this before the due date.  
