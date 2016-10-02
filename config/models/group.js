var mongoose=require('mongoose');

var GroupSchema = new mongoose.Schema({
    score: Number,
    name: String,
    lName: String,
    verbose: String,
    created: Date,
//    owner: String,
    open: Boolean,
    admins: Array,
    members: Array
});

module.exports=mongoose.model('group', GroupSchema);
