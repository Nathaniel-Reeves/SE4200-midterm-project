# SE4200-midterm-project
Web II midterm project.  A simple web app to help teams and judges at codecamp.

Here is the deployed application link:
http://codecamp.us-east-1.elasticbeanstalk.com/

If you would like to explore the app without creating an account, here are some credentials you can use.

### All permissions allowed

```json
{
    "email": "john@example.com",
    "password": "asdfasdf123",
    "first_name": "John",
    "last_name": "Doe",
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
    "last_name": "Brown"
}
```

All user passwords are stored as encrypted hashes using bcrypt.

## Submission Notes

Unfortunately, I did not get this project finished as much as I'd like it to be.  The back end was completely done with solid validation for every input and great feedback for each output.  However, I did not leave enough time to complete the clint side of this project.  

I understand this might dock me on the grade, however I would like to concider giving me some leway.  There was so much I learned working on this project and I put so much time and effort into it.  I just allowed my project to get a bit larger than I could handle in this time frame.  By the time the big presentation comes around, this project will be much more complete.

A list of ideas I wanted to implement but didn't get around to..

1. A server synced countdown timer that is configured through a admin console.
1. The ability to change what is displayed on the website from the admin console.  Such as sponsorship ads and other branding.
1. The ability to save a logged in state for a user.  It looks like I need a extension to vue to get this to work. I tried to mess with it but ultimately gave up to try and finish the rest of this assignment.
1. Include better photography for the home page and other pages.  
1. A judge console that is personalized to the account of the user. From this console, a judge could add, change, or delete judge entries as needed.
1. A attendent console.  This is meant to be for the front desk person that could help contestants with changes to their team while at the codecamp event. 
1. A radar chart that displays the results of each team in convenient format.  I tried my best to get chartjs to work with vue however I couldn't figure it out.  As a placeholder for this feature, I included a radar chart image I found on Google.


## Visual Design Process

I used Figma to create the wireframe and story board for this project. 
Here is a link to the figma project page for your viewing.  I figured this would be easiest to do instead of a bunch of PDF files.

https://www.figma.com/file/lhDovqDS1JVYKGXaRlAbHK/Code-Camp-Score-Tool?node-id=14%3A214&t=yTIbnXjVogmyr1Ly-1


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
|GET|/logout|Logout User. (In hignsight, I probably should have used DELETE for this).|
|POST|/login|Login in User with email and password.|
|POST|/register|Creates a new user with email, first and last name, and password.|
|PUT|/toggle-user-roll/{:user_id}|This would only be accessible by users with admin privileges.  This allows the admin user to change the rolls of other users from contestants to judges to attendants|
|-|-|-|
|Teams|
|-|-|-|
|POST|/Teams|Creates a new Team, attendants or admins can do this.  Takes a team_name, team_division, and catagory variables.|
|POST|/teams/{team_id}/users/ | Adds a user to a team, attendants and admins can do this.  sends a single user id.
|DELETE| /teams/{team_id}/users/ | Removes a user from a team.  Again, only admins and attendants can preform this action. |
|PUT| /teams/{team_id}/ | Allows admins and attendants to change team attributes such as the name, division, and catagory variables|
|DELETE| /teams/{team_id}/ | Deletes an entire team. Only admins and attendents can do this.|
|GET| /teams/ | Returns all teams with all user and judge_score information populated in one bulk response |
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
