const mongoose = require("mongoose");

// profile 스키마 정의
let ProfileSchema = new mongoose.Schema({
    user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
    },
    
    party_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Party'
    },
    nickname: String,
});

let Profile = mongoose.model("Profile", ProfileSchema);
module.exports = Profile; 