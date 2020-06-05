const mongoose = require("mongoose");

const NewsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  publishedAt: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  urlToImage: {
    type: String,
    required: true
  },
  source: {
    type: Object,
    required: true
  },
  tag: {
    type: String,
    required: true
  },
  dateStored: {
    type: Date,
    default: Date.now
  }
});

const UpdateSchema = new mongoose.Schema({
  lastTopNewsUpdate: {
    type: Date
  },
  lastVideoUpdate: {
    type: Date
  },
  lastInternationalNewsUpdate: {
    type: Date
  },
  lastNigeriaBusinessNewsUpdate: {
    type: Date
  },
  lastNigeriaEntertainmentNewsUpdate: {
    type: Date
  },
  lastNigeriaPoliticsNewsUpdate: {
    type: Date
  }
});

const News = mongoose.model("News", NewsSchema);
const Updates = mongoose.model("Updates", UpdateSchema);

module.exports = {
  News,
  Updates
};
