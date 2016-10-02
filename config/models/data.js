var mongoose=require('mongoose');

var DataSchema = new mongoose.Schema({
    label: String,
    filter: {},
    Favourite: String
});

module.exports=mongoose.model('jsonall', DataSchema);
