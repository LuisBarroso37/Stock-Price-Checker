const mongoose = require('mongoose');

mongoose.connect(process.env.DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {console.log("Connected to MongoDB")});

let stockSchema = new mongoose.Schema({
    stock: String,
    price: String,
    likes: [String]
});

module.exports = mongoose.model('Stock', stockSchema);