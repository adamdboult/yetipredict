var mongoose=require('mongoose');
var bcrypt=require('bcrypt-nodejs');

var outcomeSchema=new mongoose.Schema({
    answer: String,
    prediction: String,
    group: String,
    outcome: Boolean,
    date: Date,
    score: Number
});

var userSchema=new mongoose.Schema({
    local            : {
        email        : String,
	username     : String,
        password     : String,
	//groups       : Array,
	admin        : Boolean
    },
    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    twitter          : {
        id           : String,
        token        : String,
        displayName  : String,
        username     : String
    },
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    outcomes: [outcomeSchema],
    groupsProper:Array,
    adminsProper:Array,
    predictionsProper:Array,
    predictionsAdminProper:Array,
    groups: Array,
    admins: Array,
    predictions: Array,
    predictionsAdmin: Array,
    score: Number,
    groupScores: Array
});

userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

module.exports=mongoose.model('user', userSchema);
