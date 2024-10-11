var mongoose = require("mongoose");

var predictDataSchema = new mongoose.Schema({
  val: Number,
  weight: Number,
  name: String,
  date: Date,
  answer: String,
});

var voteSchema = new mongoose.Schema({
  outcome: Number,
  name: String,
  date: Date,
});

var commentSchema = new mongoose.Schema({
  vote: [voteSchema],
  name: String,
  date: Date,
  text: String,
  score: Number,
});

var updateSchema = new mongoose.Schema({
  name: String,
  date: Date,
  text: String,
});

var answerSchema = new mongoose.Schema({
  answer: String,
  outcome: Number,
  decider: String,
  decideDate: Date,
  decideVerbose: String,
});

var predictSchema = new mongoose.Schema({
  score: Number,
  desc: String,
  verbose: String,
  verboseUpdate: [updateSchema],
  ldesc: String,
  answers: Array,
  complete: Boolean,
  outcomes: [answerSchema],
  author: String,
  lauthor: String,
  headline: Array,
  start: Date,
  open: Boolean,
  end: Date,
  textOnly: Boolean,
  users: Array,
  min: Number,
  max: Number,
  scale: Number,
  group: String,
  groupProper: String,
  source: String,
  data: [predictDataSchema],
  vote: [voteSchema],
  comment: [commentSchema],
  anon: Boolean,
});

module.exports = mongoose.model("predict", predictSchema);
