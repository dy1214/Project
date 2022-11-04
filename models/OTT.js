const mongoose = require("mongoose");

// OTT 스키마 정의
let OTTSchema = new mongoose.Schema({
    name: String,
    price: Number,
});

let OTT = mongoose.model("OTT", OTTSchema);
module.exports = OTT; 